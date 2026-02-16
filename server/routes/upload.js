import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { authenticateDJ } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Use /data/uploads for persistent storage (Railway volume mounted at /data)
// Falls back to local uploads directory for development
// Check if /data exists (Railway volume) or use NODE_ENV
const isProduction = existsSync('/data') || process.env.NODE_ENV === 'production';
const uploadsDir = isProduction
  ? '/data/uploads/covers'
  : join(__dirname, '..', 'uploads', 'covers');

console.log('Upload configuration:', {
  isProduction,
  uploadsDir,
  dataExists: existsSync('/data'),
  NODE_ENV: process.env.NODE_ENV
});

if (!existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  mkdirSync(uploadsDir, { recursive: true });
} else {
  console.log('Uploads directory already exists:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `cover-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

/**
 * POST /api/upload/cover
 * Upload cover image for event
 */
router.post('/cover', authenticateDJ, upload.single('cover'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });

    // Return the URL where the file can be accessed
    const fileUrl = `/uploads/covers/${req.file.filename}`;

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
});

export default router;
