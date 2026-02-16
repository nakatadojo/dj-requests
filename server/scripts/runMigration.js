#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node runMigration.js <migration-file.sql>');
  process.exit(1);
}

try {
  const migrationPath = join(__dirname, '../db/migrations', migrationFile);
  const sql = readFileSync(migrationPath, 'utf-8');

  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n📦 Running migration: ${migrationFile}\n`);

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 60)}...`);
    db.exec(statement);
  }

  console.log('\n✅ Migration completed successfully!\n');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
