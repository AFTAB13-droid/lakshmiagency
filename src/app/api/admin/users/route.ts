import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User, UserRole } from "@/models/User";
import { OtpLog } from "@/models/OtpLog";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const users = await User.find({}).sort({ createdAt: -1 }).select("-password");
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isActive } = await req.json();
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password");
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("id");
    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId || body.id;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === UserRole.ADMIN) {
      return NextResponse.json({ error: "Cannot delete an Administrator account" }, { status: 403 });
    }

    if (targetUser.email) {
      await OtpLog.deleteMany({ email: targetUser.email.toLowerCase().trim() });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: `${targetUser.name} (${targetUser.email}) permanently removed from database. They can register again.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
