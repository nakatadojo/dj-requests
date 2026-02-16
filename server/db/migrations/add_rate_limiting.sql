-- Add rate limiting fields to events table
ALTER TABLE events ADD COLUMN requests_per_hour INTEGER DEFAULT 0; -- 0 = unlimited
ALTER TABLE events ADD COLUMN rate_limit_message TEXT DEFAULT 'You''ve reached the request limit. Please wait before submitting another song.';

-- Add requester_ip to song_requests for tracking
ALTER TABLE song_requests ADD COLUMN requester_ip TEXT;

-- Index for faster rate limit checks
CREATE INDEX IF NOT EXISTS idx_song_requests_ip_time ON song_requests(requester_ip, created_at);
