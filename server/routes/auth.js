import express from 'express';
import bcrypt from 'bcrypt';
import db, { generateId } from '../db/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * DJ login endpoint
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find DJ by email
    const dj = db.prepare('SELECT * FROM djs WHERE email = ?').get(email);

    if (!dj) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dj.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(dj.id);

    // Return token and DJ info (without password hash)
    res.json({
      token,
      dj: {
        id: dj.id,
        email: dj.email,
        venmo_username: dj.venmo_username,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/create-dj
 * Create new DJ account (admin/CLI only - not exposed publicly)
 * This endpoint should be protected or only used via CLI script
 */
router.post('/create-dj', async (req, res, next) => {
  try {
    const { email, password, venmo_username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM djs WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create DJ
    const id = generateId();
    db.prepare(`
      INSERT INTO djs (id, email, password_hash, venmo_username)
      VALUES (?, ?, ?, ?)
    `).run(id, email, password_hash, venmo_username || null);

    res.status(201).json({
      message: 'DJ account created successfully',
      dj: { id, email, venmo_username }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
