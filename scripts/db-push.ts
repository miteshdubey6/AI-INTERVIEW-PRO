import { db } from '../server/db';
import { users, interviews, questions } from '../shared/schema';

console.log('🛠 Pushing database schema...');

async function main() {
  try {
    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_type TEXT NOT NULL,
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
        completed BOOLEAN DEFAULT FALSE NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        interview_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        user_answer TEXT,
        feedback JSONB,
        score INTEGER,
        "order" INTEGER NOT NULL
      );
    `);

    console.log('✅ Database schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });