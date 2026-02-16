import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, 'requests.db');

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
try {
  const rateLimitMigration = readFileSync(join(__dirname, 'migrations/add_rate_limiting.sql'), 'utf-8');
  const statements = rateLimitMigration.split(';').map(s => s.trim()).filter(s => s.length > 0);

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
    console.error('Migration error:', err.message);
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
