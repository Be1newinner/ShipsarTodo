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

    const { inviteCode } = await request.json();
    if (!inviteCode || inviteCode.trim() === "") {
      return NextResponse.json(
        { message: "Invite code is required" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const projectsCollection = db.collection("projects");
    const project = await projectsCollection.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!project) {
      return NextResponse.json(
        { message: "Invalid invite code" },
        { status: 404 },
      );
    }

    const projectId = project._id.toString();

    const usersCollection = db.collection("users");
    const dbUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });

    if (!dbUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (dbUser.projects && dbUser.projects.includes(projectId)) {
      return NextResponse.json(
        { message: "You are already a member of this project" },
        { status: 400 },
      );
    }

    // Add user to project members
    await projectsCollection.updateOne(
      { _id: project._id },
      {
        $push: {
          members: {
            userId: userPayload.userId,
            email: dbUser.email,
            name: dbUser.name,
            role: "member",
            joinedAt: new Date(),
          },
        } as any,
      },
    );

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
      { message: "Successfully joined project", projectId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Join project error:", error);
    return NextResponse.json(
      { message: "Failed to join project" },
      { status: 500 },
    );
  }
}
