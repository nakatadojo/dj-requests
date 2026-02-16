import express from 'express';
import db, { generateId, getTimestamp } from '../db/database.js';
import { authenticateDJ } from '../middleware/auth.js';
import { songMatches, matchesBlockPattern } from '../utils/fuzzyMatch.js';

const router = express.Router();

/**
 * Get client IP address from request
 * Handles proxies and Railway's forwarding
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
}

/**
 * GET /api/events/:slug/requests
 * Get all song requests for an event (public)
 */
router.get('/:slug/requests', (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const requests = db.prepare(`
      SELECT * FROM song_requests
      WHERE event_id = ? AND status IN ('queued', 'pinned')
      ORDER BY
        CASE WHEN status = 'pinned' THEN 0 ELSE 1 END,
        upvotes DESC,
        created_at ASC
    `).all(event.id);

    // Parse upvoter_sessions for each request
    const requestsWithParsed = requests.map(r => ({
      ...r,
      upvoter_sessions: JSON.parse(r.upvoter_sessions),
    }));

    res.json(requestsWithParsed);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:slug/requests
 * Submit a song request (public - for attendees)
 */
router.post('/:slug/requests', (req, res, next) => {
  try {
    const { song_name, artist, requester_name } = req.body;
    const clientIp = getClientIp(req);

    if (!song_name || !artist) {
      return res.status(400).json({ error: 'Song name and artist are required' });
    }

    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ error: 'Event has ended' });
    }

    // Check rate limiting (if enabled)
    if (event.requests_per_hour && event.requests_per_hour > 0) {
      const oneHourAgo = getTimestamp() - 3600; // 3600 seconds = 1 hour

      const recentRequests = db.prepare(`
        SELECT COUNT(*) as count
        FROM song_requests
        WHERE event_id = ? AND requester_ip = ? AND created_at > ?
      `).get(event.id, clientIp, oneHourAgo);

      if (recentRequests.count >= event.requests_per_hour) {
        return res.status(429).json({
          error: event.rate_limit_message || 'You\'ve reached the request limit. Please wait before submitting another song.'
        });
      }
    }

    // Get DJ's block list
    const dj = db.prepare('SELECT id FROM djs WHERE id = ?').get(event.dj_id);
    const blockPatterns = db.prepare(`
      SELECT song_pattern FROM blocklist WHERE dj_id = ?
    `).all(dj.id);

    // Check if song matches any block pattern
    for (const { song_pattern } of blockPatterns) {
      if (matchesBlockPattern(song_name, song_pattern)) {
        return res.status(400).json({
          error: 'This song isn\'t available for requests at this event.'
        });
      }
    }

    // Check for duplicates in current queue
    const existingRequests = db.prepare(`
      SELECT * FROM song_requests
      WHERE event_id = ? AND status IN ('queued', 'pinned')
    `).all(event.id);

    const duplicate = existingRequests.find(r => songMatches(r, { song_name, artist }));

    if (duplicate) {
      // Auto-upvote the existing request
      const upvoters = JSON.parse(duplicate.upvoter_sessions);

      if (upvoters.includes(clientIp)) {
        return res.status(400).json({
          error: 'You have already upvoted this song',
          isDuplicate: true,
        });
      }

      upvoters.push(clientIp);
      const newUpvotes = duplicate.upvotes + 1;

      db.prepare(`
        UPDATE song_requests
        SET upvotes = ?, upvoter_sessions = ?
        WHERE id = ?
      `).run(newUpvotes, JSON.stringify(upvoters), duplicate.id);

      return res.status(200).json({
        message: 'This song has already been requested! We\'ve added your upvote instead.',
        isDuplicate: true,
        request: {
          ...duplicate,
          upvotes: newUpvotes,
          upvoter_sessions: upvoters,
        }
      });
    }

    // Create new request
    const id = generateId();
    db.prepare(`
      INSERT INTO song_requests (id, event_id, song_name, artist, requester_name, upvotes, upvoter_sessions, requester_ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event.id,
      song_name,
      artist,
      requester_name || 'Anonymous',
      1, // Start with 1 upvote (from requester)
      JSON.stringify([clientIp]), // Initialize with requester's IP
      clientIp // Store requester IP for rate limiting
    );

    const newRequest = db.prepare('SELECT * FROM song_requests WHERE id = ?').get(id);

    res.status(201).json({
      ...newRequest,
      upvoter_sessions: JSON.parse(newRequest.upvoter_sessions),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/requests/:id/upvote
 * Upvote a song request (public)
 */
router.post('/:id/upvote', (req, res, next) => {
  try {
    const clientIp = getClientIp(req);

    const request = db.prepare('SELECT * FROM song_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const upvoters = JSON.parse(request.upvoter_sessions);

    // Check if this IP has already upvoted
    if (upvoters.includes(clientIp)) {
      return res.status(400).json({ error: 'You have already upvoted this song' });
    }

    upvoters.push(clientIp);
    const newUpvotes = request.upvotes + 1;

    db.prepare(`
      UPDATE song_requests
      SET upvotes = ?, upvoter_sessions = ?
      WHERE id = ?
    `).run(newUpvotes, JSON.stringify(upvoters), req.params.id);

    res.json({
      ...request,
      upvotes: newUpvotes,
      upvoter_sessions: upvoters,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/requests/:id
 * Update request status (DJ only: play, skip, pin)
 */
router.patch('/:id', authenticateDJ, (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['queued', 'pinned', 'played', 'skipped'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = db.prepare('SELECT * FROM song_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify DJ owns the event
    const event = db.prepare('SELECT dj_id FROM events WHERE id = ?').get(request.event_id);
    if (event.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const played_at = status === 'played' ? getTimestamp() : null;

    db.prepare(`
      UPDATE song_requests
      SET status = ?, played_at = ?
      WHERE id = ?
    `).run(status, played_at, req.params.id);

    const updatedRequest = db.prepare('SELECT * FROM song_requests WHERE id = ?').get(req.params.id);

    res.json({
      ...updatedRequest,
      upvoter_sessions: JSON.parse(updatedRequest.upvoter_sessions),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
