-- Add visible field to control whether recurring events are shown to attendees
-- Default to 1 (visible) for existing events
ALTER TABLE events ADD COLUMN visible INTEGER DEFAULT 1;
