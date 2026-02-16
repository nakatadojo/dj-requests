import express from 'express';
import db, { generateId, getTimestamp } from '../db/database.js';
import { authenticateDJ } from '../middleware/auth.js';
import { generateEventSlug } from '../utils/slugify.js';

const router = express.Router();

/**
 * GET /api/events
 * Get all events for authenticated DJ
 */
router.get('/', authenticateDJ, (req, res, next) => {
  try {
    const events = db.prepare(`
      SELECT * FROM events
      WHERE dj_id = ?
      ORDER BY created_at DESC
    `).all(req.djId);

    // Parse genre_tags JSON for each event
    const eventsWithParsedTags = events.map(event => ({
      ...event,
      genre_tags: event.genre_tags ? JSON.parse(event.genre_tags) : [],
      queue_visible: Boolean(event.queue_visible),
    }));

    res.json(eventsWithParsedTags);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events
 * Create new event
 */
router.post('/', authenticateDJ, (req, res, next) => {
  try {
    const { name, date, genre_tags, venmo_username, queue_visible, requests_per_hour, rate_limit_message } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Event name and date are required' });
    }

    const id = generateId();
    const slug = generateEventSlug(name);
    const genreTagsJson = genre_tags ? JSON.stringify(genre_tags) : null;

    db.prepare(`
      INSERT INTO events (id, dj_id, slug, name, date, genre_tags, venmo_username, queue_visible, status, requests_per_hour, rate_limit_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(
      id,
      req.djId,
      slug,
      name,
      date,
      genreTagsJson,
      venmo_username || null,
      queue_visible !== false ? 1 : 0,
      requests_per_hour || 0,
      rate_limit_message || null
    );

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    res.status(201).json({
      ...event,
      genre_tags: event.genre_tags ? JSON.parse(event.genre_tags) : [],
      queue_visible: Boolean(event.queue_visible),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:slug
 * Get event by slug (public - for attendees)
 */
router.get('/:slug', (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      ...event,
      genre_tags: event.genre_tags ? JSON.parse(event.genre_tags) : [],
      queue_visible: Boolean(event.queue_visible),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/events/:slug
 * Update event (toggle queue visibility, update details)
 */
router.patch('/:slug', authenticateDJ, (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized to modify this event' });
    }

    const { queue_visible, venmo_username, name, date, genre_tags, requests_per_hour, rate_limit_message } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (queue_visible !== undefined) {
      updates.push('queue_visible = ?');
      values.push(queue_visible ? 1 : 0);
    }
    if (venmo_username !== undefined) {
      updates.push('venmo_username = ?');
      values.push(venmo_username);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (date) {
      updates.push('date = ?');
      values.push(date);
    }
    if (genre_tags) {
      updates.push('genre_tags = ?');
      values.push(JSON.stringify(genre_tags));
    }
    if (requests_per_hour !== undefined) {
      updates.push('requests_per_hour = ?');
      values.push(requests_per_hour || 0);
    }
    if (rate_limit_message !== undefined) {
      updates.push('rate_limit_message = ?');
      values.push(rate_limit_message || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.slug);
    db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE slug = ?`).run(...values);

    const updatedEvent = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    res.json({
      ...updatedEvent,
      genre_tags: updatedEvent.genre_tags ? JSON.parse(updatedEvent.genre_tags) : [],
      queue_visible: Boolean(updatedEvent.queue_visible),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:slug/end
 * End an event
 */
router.post('/:slug/end', authenticateDJ, (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized to end this event' });
    }

    if (event.status === 'ended') {
      return res.status(400).json({ error: 'Event already ended' });
    }

    const ended_at = getTimestamp();
    db.prepare(`
      UPDATE events
      SET status = 'ended', ended_at = ?
      WHERE slug = ?
    `).run(ended_at, req.params.slug);

    const updatedEvent = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    res.json({
      ...updatedEvent,
      genre_tags: updatedEvent.genre_tags ? JSON.parse(updatedEvent.genre_tags) : [],
      queue_visible: Boolean(updatedEvent.queue_visible),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/:slug
 * Delete an event (DJ only)
 */
router.delete('/:slug', authenticateDJ, (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Delete the event (CASCADE will delete related requests and blocklist entries)
    db.prepare('DELETE FROM events WHERE slug = ?').run(req.params.slug);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:slug/analytics
 * Get analytics for an ended event
 */
router.get('/:slug/analytics', authenticateDJ, (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(req.params.slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.dj_id !== req.djId) {
      return res.status(403).json({ error: 'Not authorized to view analytics for this event' });
    }

    // Get all requests for this event
    const requests = db.prepare(`
      SELECT * FROM song_requests WHERE event_id = ?
    `).all(event.id);

    // Calculate analytics
    const totalRequests = requests.length;

    // Unique requesters (count unique session IDs)
    const allSessions = new Set();
    requests.forEach(req => {
      const sessions = JSON.parse(req.upvoter_sessions);
      sessions.forEach(s => allSessions.add(s));
    });
    const uniqueRequesters = allSessions.size;

    // Played vs skipped
    const played = requests.filter(r => r.status === 'played').length;
    const skipped = requests.filter(r => r.status === 'skipped').length;

    // Top 10 most upvoted songs
    const topSongs = requests
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 10)
      .map(r => ({
        song_name: r.song_name,
        artist: r.artist,
        upvotes: r.upvotes,
        requester_name: r.requester_name,
      }));

    // Average upvotes
    const avgUpvotes = totalRequests > 0
      ? (requests.reduce((sum, r) => sum + r.upvotes, 0) / totalRequests).toFixed(2)
      : 0;

    // Request timeline (group by hour)
    const timeline = {};
    requests.forEach(r => {
      const hour = new Date(r.created_at * 1000).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      timeline[hour] = (timeline[hour] || 0) + 1;
    });

    res.json({
      totalRequests,
      uniqueRequesters,
      played,
      skipped,
      playedPercentage: totalRequests > 0 ? ((played / totalRequests) * 100).toFixed(1) : 0,
      skippedPercentage: totalRequests > 0 ? ((skipped / totalRequests) * 100).toFixed(1) : 0,
      topSongs,
      avgUpvotes: parseFloat(avgUpvotes),
      timeline,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
