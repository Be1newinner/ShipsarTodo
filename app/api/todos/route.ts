import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );

    // We need the user's activeProjectId
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user || !user.activeProjectId) {
      return NextResponse.json([]); // No active project, so no tasks
    }

    const todosCollection = db.collection("todos");

    const todos = await todosCollection
      .find({ projectId: user.activeProjectId })
      .sort({ dueDate: 1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Get todos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, dueDate, priority, estimatedTime } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );

    // We need the user's activeProjectId
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user || !user.activeProjectId) {
      return NextResponse.json(
        { error: "You must have an active project to create a task" },
        { status: 400 },
      );
    }

    const todosCollection = db.collection("todos");

    const newTodo = {
      userId: payload.userId,
      projectId: user.activeProjectId,
      title,
      description: description || "",
      dueDate,
      priority: priority || "medium",
      status: "pending",
      estimatedTime: estimatedTime || 0,
      actualTime: 0,
      completionProbability: 50,
      subtasks: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await todosCollection.insertOne(newTodo);

    return NextResponse.json(
      { _id: result.insertedId, ...newTodo },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create todo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
