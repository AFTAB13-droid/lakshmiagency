import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Please provide both new password and confirm password." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirm password do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // @ts-ignore
    const adminId = session.user.id;
    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin user record not found." }, { status: 404 });
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    adminUser.password = hashedPassword;
    await adminUser.save();

    // Dispatch Security Notification
    try {
      await Notification.create({
        recipient: adminUser._id,
        recipientRole: "ADMIN",
        title: "🔐 Admin Password Updated",
        message: "Your master administrator password was successfully changed without OTP.",
        type: "SECURITY_ALERT",
        link: "/admin/security",
      });
    } catch (notifErr) {
      console.error("Failed to create admin password change notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Admin password successfully changed!",
    });
  } catch (err: any) {
    console.error("Change admin password error:", err);
    return NextResponse.json({ error: err.message || "Failed to update password." }, { status: 500 });
  }
}
