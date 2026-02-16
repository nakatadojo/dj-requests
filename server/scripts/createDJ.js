#!/usr/bin/env node

import readline from 'readline';
import bcrypt from 'bcrypt';
import db, { generateId } from '../db/database.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createDJ() {
  console.log('\n🎵 Create New DJ Account\n');

  try {
    const email = await question('Email: ');

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      rl.close();
      process.exit(1);
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM djs WHERE email = ?').get(email);
    if (existing) {
      console.error('❌ Email already registered');
      rl.close();
      process.exit(1);
    }

    const password = await question('Password: ');

    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    const venmo_username = await question('Venmo Username (optional, press Enter to skip): ');

    // Hash password
    console.log('\nCreating account...');
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
    console.log('\nYou can now login at http://localhost:5173\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error creating DJ account:', error.message);
    rl.close();
    process.exit(1);
  }
}

createDJ();
