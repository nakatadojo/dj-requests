-- Add subscription fields to DJs table
ALTER TABLE djs ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE djs ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE djs ADD COLUMN subscription_status TEXT DEFAULT 'none' CHECK(subscription_status IN ('none', 'active', 'canceled', 'past_due', 'trialing'));
ALTER TABLE djs ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'starter', 'pro', 'enterprise'));
ALTER TABLE djs ADD COLUMN subscription_ends_at INTEGER;

-- Index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_djs_stripe_customer ON djs(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_djs_subscription_status ON djs(subscription_status);
