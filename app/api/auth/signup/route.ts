import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    const hashedPassword = await hashPassword(password);

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 },
        );
      } else {
        // Update unverified user with new OTP and credentials
        await usersCollection.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name,
              password: hashedPassword,
              otp,
              otpExpiry,
              updatedAt: new Date(),
            },
          },
        );

        // Send OTP email
        await sendEmail({
          to: email,
          subject: "Your Signup OTP",
          html: `<p>Hi ${name},</p><p>Your OTP for signup is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        });

        return NextResponse.json(
          { message: "OTP sent to your email", email },
          { status: 200 },
        );
      }
    }

    // Create user
    const newUser = {
      email,
      name,
      password: hashedPassword,
      timezone: "UTC",
      role: "user",
      onboardingComplete: false,
      isVerified: false,
      otp,
      otpExpiry,
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    await logActivity(result.insertedId.toString(), "signup_initiated", {
      email,
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Your Signup OTP",
      html: `<p>Hi ${name},</p><p>Your OTP for signup is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    return NextResponse.json(
      { message: "OTP sent to your email", email, userId: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
