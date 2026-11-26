import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, mobile, password, role } = await req.json();

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ error: "Name, email, mobile, and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const assignedRole = role === UserRole.PREMIUM_USER ? UserRole.PREMIUM_USER : UserRole.USER;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,
      role: assignedRole,
      isActive: true,
      mediatorApprovalStatus: "APPROVED",
      mediatorApprovedAt: new Date(),
    });

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj, message: "User created and activated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isActive, action, reason } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await connectToDatabase();

    let updateData: Record<string, any> = {};
    if (action === "APPROVE") {
      updateData = {
        mediatorApprovalStatus: "APPROVED",
        isActive: true,
        mediatorApprovedAt: new Date(),
        $unset: { mediatorRejectionReason: "" },
      };
    } else if (action === "REJECT") {
      updateData = {
        mediatorApprovalStatus: "REJECTED",
        isActive: false,
        mediatorRejectionReason: reason || "Request rejected by administration",
      };
    } else if (action === "RESET_PENDING") {
      updateData = {
        mediatorApprovalStatus: "PENDING",
        isActive: false,
        $unset: { mediatorRejectionReason: "" },
      };
    } else {
      updateData = { isActive };
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
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
