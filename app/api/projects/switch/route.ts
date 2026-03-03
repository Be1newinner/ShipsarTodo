import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userPayload = verifyToken(token);
    if (!userPayload)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (!user.projects || !user.projects.includes(projectId)) {
      return NextResponse.json(
        { message: "You are not a member of this project" },
        { status: 403 },
      );
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userPayload.userId) },
      { $set: { activeProjectId: projectId } },
    );

    return NextResponse.json(
      { message: "Active project updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Switch project error:", error);
    return NextResponse.json(
      { message: "Failed to switch project" },
      { status: 500 },
    );
  }
}
