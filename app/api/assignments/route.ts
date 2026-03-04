import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { todoId, assignedTo, delegationMessage } = await request.json();

    const { db } = await connectToDatabase();

    // Validate users and todo
    const usersCollection = db.collection("users");
    const todosCollection = db.collection("todos");
    const projectsCollection = db.collection("projects");

    const [assigner, assignee, todo] = await Promise.all([
      usersCollection.findOne({ _id: new ObjectId(user.userId) }),
      usersCollection.findOne({ _id: new ObjectId(assignedTo) }),
      todosCollection.findOne({ _id: new ObjectId(todoId) }),
    ]);

    if (!assigner || !assignee || !todo) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    const assignmentCollection = db.collection("assignments");
    const notificationCollection = db.collection("notifications");

    // Create assignment history record
    const assignment = await assignmentCollection.insertOne({
      todoId: new ObjectId(todoId),
      assignedBy: user.userId,
      assignedTo,
      status: "pending",
      delegationMessage: delegationMessage || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fetch project to get all members
    const project = await projectsCollection.findOne({
      _id: new ObjectId(todo.projectId),
    });

    if (project && project.members) {
      // Create notification for ALL project members EXCEPT the assigner
      const notifications = project.members
        .filter((member: any) => member.userId !== user.userId)
        .map((member: any) => {
          const isAssignee = member.userId === assignedTo;
          return {
            userId: member.userId,
            type: "assignment",
            title: isAssignee ? "New Task Assignment" : "Team Task Assignment",
            message: isAssignee
              ? `${assigner.name || "Someone"} assigned you a task: "${todo.title}". ${delegationMessage || ""}`
              : `${assigner.name || "Someone"} assigned "${todo.title}" to ${assignee.name || "a team member"}.`,
            read: false,
            relatedId: assignment.insertedId,
            projectId: todo.projectId,
            createdAt: new Date(),
          };
        });

      if (notifications.length > 0) {
        await notificationCollection.insertMany(notifications);
      }
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { message: "Failed to create assignment" },
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
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const todoId = searchParams.get("todoId");

    const { db } = await connectToDatabase();
    const assignmentCollection = db.collection("assignments");

    const query: any = {};

    // If todoId is provided, we're fetching history for a specific todo
    if (todoId) {
      query.todoId = new ObjectId(todoId);
    } else {
      // Otherwise, we're fetching assignments relevant ONLY to the logged-in user
      query.assignedTo = user.userId;
      if (status) {
        query.status = status;
      }
    }

    const assignments = await assignmentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // For todo history, enrich with user names
    if (todoId && assignments.length > 0) {
      const usersCollection = db.collection("users");

      // Get unique complete list of user IDs involved
      const userIds = [
        ...new Set([
          ...assignments.map((a) => a.assignedBy),
          ...assignments.map((a) => a.assignedTo),
        ]),
      ].map((id) => new ObjectId(id));

      const users = await usersCollection
        .find({ _id: { $in: userIds } })
        .toArray();
      const userMap = users.reduce(
        (acc: Record<string, { name: string; email: string }>, u) => {
          acc[u._id.toString()] = { name: u.name, email: u.email };
          return acc;
        },
        {},
      );

      const enrichedAssignments = assignments.map((a) => ({
        ...a,
        assignedByName: userMap[a.assignedBy]?.name || "Unknown",
        assignedToName: userMap[a.assignedTo]?.name || "Unknown",
      }));

      return NextResponse.json(enrichedAssignments);
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { message: "Failed to get assignments" },
      { status: 500 },
    );
  }
}
