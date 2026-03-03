import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const assignmentCollection = db.collection("assignments");
    const notificationCollection = db.collection("notifications");

    const assignment = await assignmentCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        assignedTo: user.userId,
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 },
      );
    }

    // Create notification for delegator
    await notificationCollection.insertOne({
      userId: assignment.assignedBy,
      type: "assignment",
      title: `Assignment ${status}`,
      message: `Assignment for task was ${status}`,
      read: false,
      relatedId: new ObjectId(id),
      createdAt: new Date(),
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Update assignment error:", error);
    return NextResponse.json(
      { message: "Failed to update assignment" },
      { status: 500 },
    );
  }
}
