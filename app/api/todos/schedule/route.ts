import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = verifyToken(token);

    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { todoId, scheduledDate, suggestedTime } = await request.json();

    const { db } = await connectToDatabase();
    const todosCollection = db.collection("todos");

    const todo = await todosCollection.findOne({
      _id: new ObjectId(todoId),
    });

    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    const hasAccess = await verifyTodoAccess(todo, userPayload.userId, db);
    if (!hasAccess) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const result = await todosCollection.findOneAndUpdate(
      { _id: new ObjectId(todoId) },
      {
        $set: {
          scheduledDate: new Date(scheduledDate),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Schedule todo error:", error);
    return NextResponse.json(
      { message: "Failed to schedule todo" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = verifyToken(token);

    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const { db } = await connectToDatabase();

    // We need the user's activeProjectId
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });

    if (!user || !user.activeProjectId) {
      return NextResponse.json([]); // No active project, so no tasks
    }

    const todosCollection = db.collection("todos");

    const query: any = { projectId: user.activeProjectId };

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const todos = await todosCollection
      .find(query)
      .sort({ scheduledDate: 1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Get scheduled todos error:", error);
    return NextResponse.json(
      { message: "Failed to get scheduled todos" },
      { status: 500 },
    );
  }
}
