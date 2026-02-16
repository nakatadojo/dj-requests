#!/usr/bin/env node

import bcrypt from 'bcrypt';
import db, { generateId } from '../db/database.js';

async function createDJFromEnv() {
  console.log('\n🎵 Creating DJ Account from Environment Variables\n');

  const email = process.env.DJ_EMAIL || 'djxan@vivadjs.com';
  const password = process.env.DJ_PASSWORD || 'Kaname07!';
  const venmo_username = process.env.DJ_VENMO || '';

  try {
    // Check if email already exists
    const existing = db.prepare('SELECT id FROM djs WHERE email = ?').get(email);
    if (existing) {
      console.log('✅ DJ account already exists with this email');
      console.log(`   Email: ${email}`);
      console.log(`   ID: ${existing.id}`);
      process.exit(0);
    }

    // Hash password
    console.log('Creating account...');
    const password_hash = await bcrypt.hash(password, 10);

    // Create DJ
    const id = generateId();
    db.prepare(`
      INSERT INTO djs (id, email, password_hash, venmo_username)
      VALUES (?, ?, ?, ?)
    `).run(id, email, password_hash, venmo_username || null);

    console.log('\n✅ DJ account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   ID: ${id}`);
    if (venmo_username) {
      console.log(`   Venmo: @${venmo_username}`);
    }
    console.log('');

  } catch (error) {
    console.error('\n❌ Error creating DJ account:', error.message);
    process.exit(1);
  }
}

createDJFromEnv();
