import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { logActivity } from "@/lib/activity-logger";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userPayload = verifyToken(token);
    if (!userPayload)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { notificationId, action } = await req.json();

    const { db } = await connectToDatabase();
    if (!db)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 },
      );

    const notificationsCollection = db.collection("notifications");
    const projectsCollection = db.collection("projects");
    const usersCollection = db.collection("users");

    // Fetch the notification
    const notification = await notificationsCollection.findOne({
      _id: new ObjectId(notificationId),
      userId: userPayload.userId,
    });

    if (!notification || notification.type !== "team_invite") {
      return NextResponse.json(
        { message: "Invalid or missing invitation" },
        { status: 404 },
      );
    }

    // Mark as read and handled (we can just delete the invite notification or mark it handled)
    await notificationsCollection.deleteOne({
      _id: new ObjectId(notificationId),
    });

    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userPayload.userId),
    });
    const project = await projectsCollection.findOne({
      _id: new ObjectId(notification.projectId as string),
    });

    if (action === "accept" && project && currentUser) {
      // Add member to project
      await projectsCollection.updateOne(
        { _id: new ObjectId(notification.projectId as string) },
        {
          $push: {
            members: {
              userId: currentUser._id.toString(),
              email: currentUser.email,
              name: currentUser.name || currentUser.email.split("@")[0],
              role: "member",
              joinedAt: new Date(),
            },
          } as any,
        },
      );

      // Add project to user's projects array
      const updatePayload: any = {
        $push: { projects: notification.projectId },
      };
      if (!currentUser.activeProjectId) {
        updatePayload.$set = { activeProjectId: notification.projectId };
      }
      await usersCollection.updateOne({ _id: currentUser._id }, updatePayload);

      // Notify project owner
      const message = `${currentUser.name || currentUser.email} accepted your invitation to join ${project.name}.`;
      await notificationsCollection.insertOne({
        userId: notification.fromUserId,
        type: "invite_accepted",
        title: "Invitation Accepted",
        message,
        relatedItemId: currentUser._id.toString(),
        read: false,
        createdAt: new Date(),
      });

      const ownerUser = await usersCollection.findOne({
        _id: new ObjectId(notification.fromUserId),
      });
      if (ownerUser && ownerUser.email) {
        await sendEmail({
          to: ownerUser.email,
          subject: "Project Invitation Accepted",
          html: `<p>Hi ${ownerUser.name || "there"},</p><p>${message}</p>`,
        });
      }

      await logActivity(currentUser._id.toString(), "joined_team", {
        projectId: notification.projectId,
      });

      return NextResponse.json({ message: "Invitation accepted successfully" });
    } else if (action === "reject") {
      // Notify project owner
      if (project && currentUser) {
        const message = `${currentUser.name || currentUser.email} declined your invitation to join ${project.name}.`;
        await notificationsCollection.insertOne({
          userId: notification.fromUserId,
          type: "invite_rejected",
          title: "Invitation Rejected",
          message,
          relatedItemId: currentUser._id.toString(),
          read: false,
          createdAt: new Date(),
        });

        const ownerUser = await usersCollection.findOne({
          _id: new ObjectId(notification.fromUserId),
        });
        if (ownerUser && ownerUser.email) {
          await sendEmail({
            to: ownerUser.email,
            subject: "Project Invitation Declined",
            html: `<p>Hi ${ownerUser.name || "there"},</p><p>${message}</p>`,
          });
        }

        await logActivity(currentUser._id.toString(), "rejected_team_invite", {
          projectId: notification.projectId,
        });
      }

      return NextResponse.json({ message: "Invitation rejected" });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Respond invite error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
