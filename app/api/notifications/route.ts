import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json({ message: "Database error" }, { status: 500 });

    const notificationCollection = db.collection("notifications");

    const notifications = await notificationCollection
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { message: "Failed to get notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json({ message: "Database error" }, { status: 500 });

    const notificationCollection = db.collection("notifications");

    // If no body provided, mark all as read
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (body.notificationId) {
      const updated = await notificationCollection.findOneAndUpdate(
        { _id: new ObjectId(body.notificationId), userId: user.userId },
        { $set: { read: true } },
        { returnDocument: "after" },
      );
      return NextResponse.json(updated?.value || { success: true });
    } else {
      await notificationCollection.updateMany(
        { userId: user.userId, read: false },
        { $set: { read: true } },
      );
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 },
    );
  }
}
