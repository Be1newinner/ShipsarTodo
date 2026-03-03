import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "User is already verified" },
        { status: 400 },
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Mark as verified and remove OTP fields
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true, updatedAt: new Date() },
        $unset: { otp: "", otpExpiry: "" },
      },
    );

    await logActivity(user._id.toString(), "signed_up", { email });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      { userId: user._id, email: user.email, name: user.name },
      { status: 200 },
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
