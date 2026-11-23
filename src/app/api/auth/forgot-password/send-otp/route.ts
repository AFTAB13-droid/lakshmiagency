import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { OtpLog } from "@/models/OtpLog";
import { sendPasswordResetOTP } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a verification code.",
      });
    }

    const now = new Date();
    let otpRecord = await OtpLog.findOne({
      email: normalizedEmail,
      purpose: "FORGOT_PASSWORD",
    });

    if (otpRecord) {
      // Check if locked
      if (otpRecord.lockedUntil && otpRecord.lockedUntil > now) {
        const remainingMinutes = Math.ceil((otpRecord.lockedUntil.getTime() - now.getTime()) / (1000 * 60));
        return NextResponse.json(
          { error: `Maximum 3 OTP attempts reached. Please try again after ${remainingMinutes} minute(s).` },
          { status: 429 }
        );
      }

      // Check resend cooldown
      const elapsedSeconds = Math.floor((now.getTime() - otpRecord.lastSentAt.getTime()) / 1000);
      if (elapsedSeconds < otpRecord.nextResendAfter) {
        const waitMore = otpRecord.nextResendAfter - elapsedSeconds;
        return NextResponse.json(
          { error: `Please wait ${waitMore} second(s) before requesting a new OTP.` },
          { status: 429 }
        );
      }

      // 3 attempts max
      if (otpRecord.attempts >= 3) {
        otpRecord.lockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
        await otpRecord.save();
        return NextResponse.json(
          { error: "Maximum 3 OTP attempts reached. Please try again after 1 hour." },
          { status: 429 }
        );
      }

      otpRecord.attempts += 1;
      // 2nd resend wait time = 65s
      otpRecord.nextResendAfter = otpRecord.attempts === 2 ? 65 : 30;
      otpRecord.lastSentAt = now;
    } else {
      otpRecord = new OtpLog({
        email: normalizedEmail,
        purpose: "FORGOT_PASSWORD",
        attempts: 1,
        lastSentAt: now,
        nextResendAfter: 30,
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpRecord.otp = otp;
    otpRecord.expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    await otpRecord.save();

    // Send email via Nodemailer
    await sendPasswordResetOTP(user.email, user.name, otp);

    const cooldownForFrontend = otpRecord.attempts === 1 ? 30 : otpRecord.attempts === 2 ? 65 : 0;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code was sent to ${normalizedEmail}`,
      attempts: otpRecord.attempts,
      cooldownSeconds: cooldownForFrontend,
    });
  } catch (error: any) {
    console.error("Forgot password send-otp error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
