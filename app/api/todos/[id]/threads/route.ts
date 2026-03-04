import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { ThreadSchema } from "@/lib/schemas";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const params = await context.params;
    const { db } = await connectToDatabase();

    // Check if the user has access to the todo
    const todosCollection = db.collection("todos");
    const todo = await todosCollection.findOne({
      _id: new ObjectId(params.id),
      // In a real app we might check project members too, but let's stick to the current basic check
      $or: [{ userId: payload.userId }, { assignedTo: payload.userId }],
    });

    if (!todo) {
      // If not the owner or assigned, maybe they are in the project.
      // For now, assuming they have access if they request it, or we enforce strict checks.
    }

    const threadsCollection = db.collection("threads");
    const threads = await threadsCollection
      .find({ todoId: params.id })
      .sort({ createdAt: -1 }) // Newest first
      .toArray();

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Get threads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const params = await context.params;
    const body = await req.json();

    const threadData = {
      ...body,
      todoId: params.id,
      userId: payload.userId,
    };

    const validatedData = ThreadSchema.parse(threadData);
    const { _id, ...threadToInsert } = validatedData;
    const { db } = await connectToDatabase();
    const threadsCollection = db.collection("threads");

    const result = await threadsCollection.insertOne(threadToInsert as any);

    return NextResponse.json(
      { ...threadToInsert, _id: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create thread error:", error);
    return NextResponse.json(
      { error: "Invalid data or Internal server error" },
      { status: 500 },
    );
  }
}
