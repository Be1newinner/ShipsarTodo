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

    const { memberEmail } = await request.json();

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const usersCollection = db.collection("users");
    const projectsCollection = db.collection("projects");

    // Get current user to check their active project
    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });
    if (!currentUser || !currentUser.activeProjectId) {
      return NextResponse.json(
        { message: "No active project found for user" },
        { status: 400 },
      );
    }

    // Check if member exists
    const newMember = await usersCollection.findOne({ email: memberEmail });
    if (!newMember) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const projectId = currentUser.activeProjectId;
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    // Check if user is admin
    if (project.adminId !== userPayload.userId) {
      return NextResponse.json(
        { message: "Only project admins can add members directly" },
        { status: 403 },
      );
    }

    // Check if member already in project
    const existingMember = project.members?.find(
      (m: any) =>
        m.userId.toString() === newMember._id.toString() ||
        (m.email && m.email.toLowerCase() === newMember.email.toLowerCase()),
    );

    if (existingMember) {
      return NextResponse.json(
        { message: "Member already in project" },
        { status: 400 },
      );
    }

    // Add member to project
    const updated = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      {
        $push: {
          members: {
            userId: newMember._id.toString(),
            email: newMember.email,
            name: newMember.name || newMember.email.split("@")[0],
            role: "member",
            joinedAt: new Date(),
          },
        } as any,
      },
      { returnDocument: "after" },
    );

    // Also update the member's user document
    const updatePayload: any = {
      $push: { projects: projectId },
    };
    if (!newMember.activeProjectId) {
      updatePayload.$set = { activeProjectId: projectId };
    }
    await usersCollection.updateOne({ _id: newMember._id }, updatePayload);

    // Map back to team structure (for frontend compatibility)
    const teamFormat = {
      owner: project.adminId,
      members: updated?.members?.map((m: any) => ({
        _id: m.userId,
        email: m.email,
        name: m.name,
        role: m.role === "admin" ? "owner" : "member",
        joinedAt: m.joinedAt,
      })),
    };

    return NextResponse.json(teamFormat);
  } catch (error) {
    console.error("Add team member error:", error);
    return NextResponse.json(
      { message: "Failed to add team member" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userPayload = verifyToken(token);
    if (!userPayload)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const usersCollection = db.collection("users");
    const projectsCollection = db.collection("projects");

    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });

    if (!currentUser || !currentUser.activeProjectId) {
      // Return empty team if no active project
      return NextResponse.json({ owner: userPayload.userId, members: [] });
    }

    const project = await projectsCollection.findOne({
      _id: new ObjectId(currentUser.activeProjectId),
    });

    if (!project) {
      return NextResponse.json({ owner: userPayload.userId, members: [] });
    }

    // Format for frontend
    const teamFormat = {
      owner: project.adminId,
      inviteCode: project.inviteCode,
      members: project.members?.map((m: any) => ({
        _id: m.userId,
        email: m.email,
        name: m.name,
        role: m.role === "admin" ? "owner" : "member",
        joinedAt: m.joinedAt,
      })),
    };

    return NextResponse.json(teamFormat);
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json(
      { message: "Failed to get team" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userPayload = verifyToken(token);
    if (!userPayload)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const memberEmail = searchParams.get("email");

    if (!memberEmail) {
      return NextResponse.json(
        { message: "Member email is required" },
        { status: 400 },
      );
    }

    if (memberEmail.toLowerCase() === userPayload.email.toLowerCase()) {
      return NextResponse.json(
        { message: "Cannot remove yourself from the team" },
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
    const projectsCollection = db.collection("projects");

    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });
    if (!currentUser || !currentUser.activeProjectId) {
      return NextResponse.json(
        { message: "No active project found" },
        { status: 400 },
      );
    }

    const projectId = currentUser.activeProjectId;
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    if (project.adminId !== userPayload.userId) {
      return NextResponse.json(
        { message: "Only project admins can remove members" },
        { status: 403 },
      );
    }

    const memberToRemove = await usersCollection.findOne({
      email: new RegExp(`^${memberEmail}$`, "i"),
    });
    if (!memberToRemove) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updated = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      {
        $pull: {
          members: {
            email: new RegExp(`^${memberEmail}$`, "i"),
            role: { $ne: "admin" },
          },
        } as any,
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Failed to remove from project" },
        { status: 500 },
      );
    }

    // Update the removed user's properties. Removing project list reference
    const activeProjectCheck =
      memberToRemove.activeProjectId === projectId
        ? { activeProjectId: null }
        : {};

    await usersCollection.updateOne(
      { _id: memberToRemove._id },
      {
        $pull: { projects: projectId } as any,
        $set: activeProjectCheck as any,
      },
    );

    const teamFormat = {
      owner: updated.adminId,
      members: updated.members?.map((m: any) => ({
        _id: m.userId,
        email: m.email,
        name: m.name,
        role: m.role === "admin" ? "owner" : "member",
        joinedAt: m.joinedAt,
      })),
    };

    return NextResponse.json({
      message: "Member removed successfully",
      team: teamFormat,
    });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { message: "Failed to remove team member" },
      { status: 500 },
    );
  }
}
