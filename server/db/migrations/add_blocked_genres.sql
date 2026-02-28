CREATE TABLE IF NOT EXISTS blocked_genres (
    id TEXT PRIMARY KEY,
    dj_id TEXT NOT NULL,
    genre TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (dj_id) REFERENCES djs(id) ON DELETE CASCADE
);