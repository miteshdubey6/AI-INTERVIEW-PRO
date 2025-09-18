#!/usr/bin/env tsx

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function initDatabase() {
  try {
    console.log('Initializing database tables...');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      )
    `);

    // Create interviews table  
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_type TEXT NOT NULL,
        score INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed BOOLEAN DEFAULT false NOT NULL
      )
    `);

    // Create questions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        interview_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        user_answer TEXT,
        feedback JSON,
        score INTEGER,
        "order" INTEGER NOT NULL
      )
    `);

    // Create session table for PostgreSQL session store
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);

    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();