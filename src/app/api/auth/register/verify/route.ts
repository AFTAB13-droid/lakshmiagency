import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User, UserRole } from "@/models/User";
import { OtpLog } from "@/models/OtpLog";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OtpLog.findOne({
      email: normalizedEmail,
      purpose: "REGISTRATION",
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord || !otpRecord.registrationData) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const { name, mobile, password, role, mediatorCode } = otpRecord.registrationData;

    // Check again to prevent race condition
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "User already registered" }, { status: 400 });
    }

    // Auto-generate mediator code if role is PREMIUM_USER and none provided
    let finalMediatorCode = mediatorCode;
    if (role === UserRole.PREMIUM_USER && !finalMediatorCode) {
      const count = await User.countDocuments({ role: UserRole.PREMIUM_USER });
      finalMediatorCode = `LAX${String(count + 1).padStart(3, "0")}`;
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      mobile,
      password,
      role: role as UserRole,
      mediatorCode: finalMediatorCode,
      isActive: true,
    });

    // Clean up OTP record
    await OtpLog.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: "Account verified and registered successfully!",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error: any) {
    console.error("Register verify error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify registration" }, { status: 500 });
  }
}
