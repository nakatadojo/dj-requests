import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// If /data volume exists (Railway), ALWAYS use it. No env var override.
const DB_PATH = existsSync('/data') ? '/data/requests.db' : join(__dirname, 'requests.db');
console.log('DB_PATH resolved to:', DB_PATH);
console.log('/data exists:', existsSync('/data'));
console.log('DB_PATH env var:', process.env.DB_PATH || '(not set)');

// Ensure the directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log('✓ Created database directory:', dbDir);
}

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Run migrations (safe to run multiple times)
const migrations = [
  'add_rate_limiting.sql',
  'add_cover_image.sql',
  'add_recurring_events.sql',
  'add_social_links.sql',
  'add_event_visibility.sql',
  'add_disclaimer.sql',
];

for (const migrationFile of migrations) {
  try {
    const migration = readFileSync(join(__dirname, 'migrations', migrationFile), 'utf-8');
    const statements = migration.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (err) {
        // Ignore "duplicate column" errors (migration already ran)
        if (!err.message.includes('duplicate column')) {
          throw err;
        }
      }
    }
  } catch (err) {
    // Migration file might not exist yet, that's ok
    if (err.code !== 'ENOENT') {
      console.error(`Migration error (${migrationFile}):`, err.message);
    }
  }
}

console.log('✓ Database initialized at:', DB_PATH);

// Helper function to generate UUID (simple version)
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper function to get current timestamp
export function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export default db;
