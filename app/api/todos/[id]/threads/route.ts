import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { ThreadSchema } from "@/lib/schemas";

async function verifyTodoAccess(
  todo: any,
  userId: string,
  db: any,
): Promise<boolean> {
  if (todo.userId === userId) return true;

  const user = await db.collection("users").findOne({
    _id: new ObjectId(userId),
  });

  if (!user) return false;

  return (
    user.activeProjectId === todo.projectId ||
    (user.projects && user.projects.includes(todo.projectId))
  );
}

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

    const todosCollection = db.collection("todos");
    const todo = await todosCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hasAccess = await verifyTodoAccess(todo, payload.userId, db);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const threadsCollection = db.collection("threads");
    const threads = await threadsCollection
      .find({ todoId: params.id })
      .sort({ createdAt: -1 })
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

    const { db } = await connectToDatabase();

    const todosCollection = db.collection("todos");
    const todo = await todosCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hasAccess = await verifyTodoAccess(todo, payload.userId, db);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const threadData = {
      ...body,
      todoId: params.id,
      userId: payload.userId,
    };

    const validatedData = ThreadSchema.parse(threadData);
    const { _id, ...threadToInsert } = validatedData;
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
