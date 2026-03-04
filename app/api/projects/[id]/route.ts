import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

    const projectsCollection = db.collection("projects");
    const project = await projectsCollection.findOne({
      _id: new ObjectId(params.id),
      "members.userId": payload.userId,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 },
      );
    }

    const todosCollection = db.collection("todos");
    const todoCount = await todosCollection.countDocuments({
      projectId: params.id,
    });

    return NextResponse.json({
      ...project,
      todoCount,
    });
  } catch (error) {
    console.error("Get project details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const projectsCollection = db.collection("projects");

    // Check if the user is the admin
    const project = await projectsCollection.findOne({
      _id: new ObjectId(params.id),
      adminId: payload.userId,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Only the project owner can delete this project" },
        { status: 403 },
      );
    }

    // Delete the project
    await projectsCollection.deleteOne({ _id: new ObjectId(params.id) });

    // Clean up references in all users who were members
    const usersCollection = db.collection("users");
    const memberIds = project.members.map((m: any) => new ObjectId(m.userId));

    await usersCollection.updateMany(
      { _id: { $in: memberIds } },
      {
        $pull: { projects: params.id } as any,
      },
    );

    // Unset activeProjectId if it matches the deleted project
    await usersCollection.updateMany(
      {
        _id: { $in: memberIds },
        activeProjectId: params.id,
      },
      {
        $unset: { activeProjectId: "" },
      },
    );

    // Delete all associated todos
    const todosCollection = db.collection("todos");
    await todosCollection.deleteMany({ projectId: params.id });

    // Assuming we also delete AI threads related to those todos
    // This could also be a background job but we can do it here simply if needed.

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
