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

    const todosCollection = db.collection("todos");
    const usersCollection = db.collection("users");

    // Fetch assignee name for the notification message
    const assignee = await usersCollection.findOne({
      _id: new ObjectId(user.userId),
    });

    if (status === "accepted") {
      // Actually assign the todo
      await todosCollection.updateOne(
        { _id: new ObjectId(assignment.todoId) },
        {
          $set: {
            assignedTo: user.userId,
            updatedAt: new Date(),
          },
        },
      );
    }

    // Get the todo to send a more descriptive notification
    const todo = await todosCollection.findOne({
      _id: new ObjectId(assignment.todoId),
    });

    // Create notification for delegator
    await notificationCollection.insertOne({
      userId: assignment.assignedBy,
      type: "assignment",
      title: `Assignment ${status === "accepted" ? "Accepted" : "Rejected"}`,
      message: `${assignee?.name || "The user"} has ${status} the assignment for "${todo?.title || "a task"}".`,
      read: false,
      relatedId: assignment.todoId, // Link this directly to the todo so they can view it
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
