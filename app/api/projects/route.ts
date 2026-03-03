import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const usersCollection = db.collection("users");
    const dbUser = await usersCollection.findOne({
      _id: new ObjectId(user.userId),
    });

    if (!dbUser || !dbUser.projects || dbUser.projects.length === 0) {
      return NextResponse.json([]);
    }

    const projectsCollection = db.collection("projects");
    const projectIds = dbUser.projects.map((id: string) => new ObjectId(id));

    const projects = await projectsCollection
      .find({ _id: { $in: projectIds } })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { message: "Failed to get projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userPayload = verifyToken(token);
    if (!userPayload)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Project name is required" },
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
    const dbUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });

    if (!dbUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const projectsCollection = db.collection("projects");

    let inviteCode = generateInviteCode();
    // Ensure uniqueness of invite code (simplistic check)
    while (await projectsCollection.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const newProject = {
      name: name.trim(),
      adminId: userPayload.userId,
      members: [
        {
          userId: userPayload.userId,
          email: dbUser.email,
          name: dbUser.name,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
      inviteCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await projectsCollection.insertOne(newProject);
    const projectId = insertResult.insertedId.toString();

    // Update user to include this project
    const updatePayload: any = {
      $push: { projects: projectId },
    };
    if (!dbUser.activeProjectId) {
      updatePayload.$set = { activeProjectId: projectId };
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userPayload.userId) },
      updatePayload,
    );

    return NextResponse.json(
      { _id: projectId, ...newProject },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 },
    );
  }
}
