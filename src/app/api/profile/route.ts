import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // @ts-ignore
    const user = await User.findById(session.user.id)
      .select("name email mobile role createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, mobile } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const cleanMobile = (mobile || "").trim();
    if (!cleanMobile || cleanMobile.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    // @ts-ignore
    const updatedUser = await User.findByIdAndUpdate(
      // @ts-ignore
      session.user.id,
      {
        name: name.trim(),
        mobile: cleanMobile,
      },
      { new: true }
    )
      .select("name email mobile role createdAt")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile details updated successfully!",
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
