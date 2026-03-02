import { MongoClient, Db } from 'mongodb';

let cached: { conn: MongoClient | null; db: Db | null } = { conn: null, db: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db('todo-scheduler');

  cached.conn = client;
  cached.db = db;

  return cached;
}
