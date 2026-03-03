import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";

export async function logActivity(
  userId: string | ObjectId,
  action: string,
  details?: any,
) {
  try {
    const { db } = await connectToDatabase();
    await db.collection("activities").insertOne({
      userId: typeof userId === "string" ? new ObjectId(userId) : userId,
      action,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
