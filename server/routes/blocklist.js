import express from 'express';
import db, { generateId } from '../db/database.js';
import { authenticateDJ } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/blocklist
 * Get all blocked song patterns for authenticated DJ
 */
router.get('/', authenticateDJ, (req, res, next) => {
  try {
    const blockedSongs = db.prepare(`
      SELECT * FROM blocklist
      WHERE dj_id = ?
      ORDER BY created_at DESC
    `).all(req.djId);

    res.json(blockedSongs);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/blocklist
 * Add a song pattern to block list
 */
router.post('/', authenticateDJ, (req, res, next) => {
  try {
    const { song_pattern } = req.body;

    if (!song_pattern || !song_pattern.trim()) {
      return res.status(400).json({ error: 'Song pattern is required' });
    }

    const id = generateId();

    db.prepare(`
      INSERT INTO blocklist (id, dj_id, song_pattern)
      VALUES (?, ?, ?)
    `).run(id, req.djId, song_pattern.trim());

    const newEntry = db.prepare('SELECT * FROM blocklist WHERE id = ?').get(id);

    res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/blocklist/:id
 * Remove a song pattern from block list
 */
router.delete('/:id', authenticateDJ, (req, res, next) => {
  try {
    const entry = db.prepare('SELECT * FROM blocklist WHERE id = ?').get(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Block list entry not found' });
    }

    if (entry.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized to delete this entry' });
    }

    db.prepare('DELETE FROM blocklist WHERE id = ?').run(req.params.id);

    res.json({ message: 'Entry removed from block list' });
  } catch (error) {
    next(error);
  }
});

// --- Blocked Genres ---

router.get('/genres', authenticateDJ, (req, res, next) => {
  try {
    const genres = db.prepare('SELECT * FROM blocked_genres WHERE dj_id = ? ORDER BY created_at DESC').all(req.djId);
    res.json(genres);
  } catch (error) {
    next(error);
  }
});

router.post('/genres', authenticateDJ, (req, res, next) => {
  try {
    const { genre } = req.body;
    if (!genre || !genre.trim()) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    const id = generateId();
    db.prepare('INSERT INTO blocked_genres (id, dj_id, genre) VALUES (?, ?, ?)').run(id, req.djId, genre.trim());

    const newEntry = db.prepare('SELECT * FROM blocked_genres WHERE id = ?').get(id);
    res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
});

router.delete('/genres/:id', authenticateDJ, (req, res, next) => {
  try {
    const entry = db.prepare('SELECT * FROM blocked_genres WHERE id = ?').get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (entry.dj_id !== req.djId) return res.status(403).json({ error: 'Not authorized' });

    db.prepare('DELETE FROM blocked_genres WHERE id = ?').run(req.params.id);
    res.json({ message: 'Genre removed from block list' });
  } catch (error) {
    next(error);
  }
});

export default router;
