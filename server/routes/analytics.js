import express from 'express';
import db from '../db/database.js';
import { authenticateDJ } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/events/:slug/song-rankings
 * Get top requested songs (for downloading songs you don't have)
 */
router.get('/:slug/song-rankings', authenticateDJ, (req, res, next) => {
  try {
    const { slug } = req.params;

    // Verify event belongs to authenticated DJ
    const event = db.prepare('SELECT * FROM events WHERE slug = ? AND dj_id = ?').get(slug, req.djId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get song rankings with total upvotes + number of times requested
    const rankings = db.prepare(`
      SELECT
        song_name,
        artist,
        COUNT(*) as request_count,
        SUM(upvotes) as total_upvotes,
        MAX(upvotes) as max_upvotes,
        GROUP_CONCAT(requester_name, ', ') as requesters,
        MAX(created_at) as last_requested
      FROM song_requests
      WHERE event_id = ?
      GROUP BY LOWER(song_name), LOWER(artist)
      ORDER BY total_upvotes DESC, request_count DESC
      LIMIT 100
    `).all(event.id);

    res.json(rankings);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:slug/hot-songs
 * Get songs people really want (high upvotes) that you might not have
 * These are the ones to download for your Serato hot folder
 */
router.get('/:slug/hot-songs', authenticateDJ, (req, res, next) => {
  try {
    const { slug } = req.params;
    const minUpvotes = parseInt(req.query.minUpvotes) || 3;

    // Verify event belongs to authenticated DJ
    const event = db.prepare('SELECT * FROM events WHERE slug = ? AND dj_id = ?').get(slug, req.djId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get songs with high demand (multiple requests or high upvotes)
    const hotSongs = db.prepare(`
      SELECT
        song_name,
        artist,
        COUNT(*) as request_count,
        SUM(upvotes) as total_upvotes,
        MAX(upvotes) as max_upvotes
      FROM song_requests
      WHERE event_id = ?
      GROUP BY LOWER(song_name), LOWER(artist)
      HAVING total_upvotes >= ? OR request_count >= 2
      ORDER BY total_upvotes DESC, request_count DESC
    `).all(event.id, minUpvotes);

    res.json(hotSongs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dj/all-time-rankings
 * Get all-time song rankings across ALL events for this DJ
 * Perfect for knowing what to add to your library
 */
router.get('/all-time-rankings', authenticateDJ, (req, res, next) => {
  try {
    const rankings = db.prepare(`
      SELECT
        sr.song_name,
        sr.artist,
        COUNT(*) as request_count,
        SUM(sr.upvotes) as total_upvotes,
        COUNT(DISTINCT sr.event_id) as events_requested_at,
        MAX(sr.created_at) as last_requested
      FROM song_requests sr
      JOIN events e ON sr.event_id = e.id
      WHERE e.dj_id = ?
      GROUP BY LOWER(sr.song_name), LOWER(sr.artist)
      ORDER BY total_upvotes DESC, request_count DESC
      LIMIT 200
    `).all(req.djId);

    res.json(rankings);
  } catch (error) {
    next(error);
  }
});

export default router;
