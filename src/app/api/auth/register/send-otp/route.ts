import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { OtpLog } from "@/models/OtpLog";
import { sendRegistrationOTP } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, mobile, email, password, role, mediatorCode } = await req.json();

    if (!name || !mobile || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and contain a mix of uppercase, lowercase, numbers, and special characters (!@#$%^&*).",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: cleanMobile }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or mobile number already exists." },
        { status: 400 }
      );
    }

    // Check OTP Lockout and Timers
    let otpRecord = await OtpLog.findOne({
      email: normalizedEmail,
      purpose: "REGISTRATION",
    });

    const now = new Date();

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

      // Increment attempt count
      if (otpRecord.attempts >= 3) {
        // Lock for 1 hour
        otpRecord.lockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
        await otpRecord.save();
        return NextResponse.json(
          { error: "Maximum 3 OTP attempts reached. Please try again after 1 hour." },
          { status: 429 }
        );
      }

      otpRecord.attempts += 1;
      // 2nd resend wait time = 65 seconds
      otpRecord.nextResendAfter = otpRecord.attempts === 2 ? 65 : 30;
      otpRecord.lastSentAt = now;
    } else {
      // 1st attempt: 30 seconds next resend cooldown
      otpRecord = new OtpLog({
        email: normalizedEmail,
        purpose: "REGISTRATION",
        attempts: 1,
        lastSentAt: now,
        nextResendAfter: 30,
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    otpRecord.otp = otp;
    otpRecord.expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    otpRecord.registrationData = {
      name: name.trim(),
      mobile: cleanMobile,
      password: hashedPassword,
      role: role || "USER",
      mediatorCode: mediatorCode?.trim().toUpperCase(),
    };

    await otpRecord.save();

    // Send Email via Nodemailer
    await sendRegistrationOTP(normalizedEmail, name, otp);

    const cooldownForFrontend = otpRecord.attempts === 1 ? 30 : otpRecord.attempts === 2 ? 65 : 0;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code was sent to ${normalizedEmail}`,
      attempts: otpRecord.attempts,
      cooldownSeconds: cooldownForFrontend,
    });
  } catch (error: any) {
    console.error("Register send-otp error:", error);
    return NextResponse.json({ error: error.message || "Failed to process registration" }, { status: 500 });
  }
}
