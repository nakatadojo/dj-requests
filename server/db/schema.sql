-- DJs table
CREATE TABLE IF NOT EXISTS djs (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    venmo_username TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    dj_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    genre_tags TEXT, -- JSON array stored as string
    venmo_username TEXT,
    queue_visible INTEGER NOT NULL DEFAULT 1, -- SQLite boolean (0 or 1)
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'ended')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    ended_at INTEGER,
    FOREIGN KEY (dj_id) REFERENCES djs(id) ON DELETE CASCADE
);

-- Song requests table
CREATE TABLE IF NOT EXISTS song_requests (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    song_name TEXT NOT NULL,
    artist TEXT NOT NULL,
    requester_name TEXT NOT NULL DEFAULT 'Anonymous',
    upvotes INTEGER NOT NULL DEFAULT 0,
    upvoter_sessions TEXT NOT NULL DEFAULT '[]', -- JSON array of session IDs
    status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'pinned', 'played', 'skipped')),
    played_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Block list table
CREATE TABLE IF NOT EXISTS blocklist (
    id TEXT PRIMARY KEY,
    dj_id TEXT NOT NULL,
    song_pattern TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (dj_id) REFERENCES djs(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_event_id ON song_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_blocklist_dj_id ON blocklist(dj_id);
