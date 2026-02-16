import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, 'requests.db');

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

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
