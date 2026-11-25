import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User, UserRole } from "@/models/User";
import { getSelfUserOrders } from "@/lib/webhookHelpers";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(id).select("-password").lean();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mobile-First matching (falls back to email ONLY if mobile matched 0 orders)
    const orders = await getSelfUserOrders(targetUser);

    // Calculate user metrics
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + (o.amount || o.payoutAmount || 0), 0);
    const approvedPaid = orders.filter((o) => o.status === "APPROVED_AND_PAID").length;
    const pendingRefunds = orders.filter(
      (o) => o.status === "ORDER_FILLED" || o.status === "REFUND_FORM_FILLED"
    ).length;
    const rejectedCount = orders.filter((o) => o.status === "REJECTED").length;

    return NextResponse.json({
      success: true,
      user: targetUser,
      stats: {
        totalOrders,
        totalAmount,
        approvedPaid,
        pendingRefunds,
        rejectedCount,
      },
      orders,
    });
  } catch (err: any) {
    console.error("Error fetching user details and orders:", err);
    return NextResponse.json({ error: err.message || "Failed to load orders" }, { status: 500 });
  }
}
