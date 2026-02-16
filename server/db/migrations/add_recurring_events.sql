-- Make date field optional for recurring events
-- SQLite doesn't support ALTER COLUMN, so we'll add a new field instead
ALTER TABLE events ADD COLUMN is_recurring INTEGER DEFAULT 0; -- 0 = one-time event, 1 = recurring event

-- For recurring events, date will be NULL
