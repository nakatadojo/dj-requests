-- Add social links fields to events table
ALTER TABLE events ADD COLUMN instagram_handle TEXT;
ALTER TABLE events ADD COLUMN twitter_handle TEXT;
ALTER TABLE events ADD COLUMN tiktok_handle TEXT;
ALTER TABLE events ADD COLUMN website_url TEXT;
