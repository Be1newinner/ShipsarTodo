import { MongoClient, Db } from "mongodb";

let cached: { conn: MongoClient | null; db: Db | null } = {
  conn: null,
  db: null,
};

export async function connectToDatabase(): Promise<{
  conn: MongoClient;
  db: Db;
}> {
  if (cached.conn && cached.db) {
    return { conn: cached.conn, db: cached.db };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("todo-scheduler");

  cached.conn = client;
  cached.db = db;

  return { conn: client, db };
}
