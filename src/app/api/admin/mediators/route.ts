import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User, UserRole } from "@/models/User";
import { Order } from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    // Query all Premium Users
    const rawPremiumUsers = await User.find({ role: UserRole.PREMIUM_USER })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch orders once and match per Premium User by userId, email, or phone
    const allOrders = await Order.find({})
      .select("buyer buyerEmail buyerPhone status payoutAmount amount")
      .lean();

    const usersWithStats = rawPremiumUsers.map((u) => {
      const uEmail = (u.email || "").toLowerCase().trim();
      const uDigits = (u.mobile || "").replace(/\D/g, "").slice(-10);
      const uId = String(u._id);

      const userOrders = allOrders.filter((o: any) => {
        if (o.buyer && String(o.buyer) === uId) return true;
        if (uEmail && (o.buyerEmail || "").toLowerCase().trim() === uEmail) return true;
        if (uDigits.length === 10) {
          const oDigits = (o.buyerPhone || "").replace(/\D/g, "").slice(-10);
          if (oDigits === uDigits) return true;
        }
        return false;
      });

      const stats = {
        totalOrders: userOrders.length,
        totalAmount: userOrders.reduce((sum, o: any) => sum + (o.payoutAmount || o.amount || 0), 0),
        approvedOrders: userOrders.filter((o: any) => o.status === "APPROVED_AND_PAID").length,
        pendingOrders: userOrders.filter((o: any) =>
          ["ORDER_FILLED", "HOLDING_PERIOD", "REFUND_FORM_FILLED"].includes(o.status)
        ).length,
      };

      const status = u.mediatorApprovalStatus || "APPROVED";

      return {
        ...u,
        mediatorApprovalStatus: status,
        stats,
      };
    });

    const pendingRequests = usersWithStats.filter(
      (u) => u.mediatorApprovalStatus === "PENDING"
    );
    const approvedMediators = usersWithStats.filter(
      (u) => u.mediatorApprovalStatus === "APPROVED"
    );
    const rejectedMediators = usersWithStats.filter(
      (u) => u.mediatorApprovalStatus === "REJECTED"
    );

    return NextResponse.json({
      success: true,
      pendingRequests,
      approvedMediators,
      rejectedMediators,
      allMediators: usersWithStats,
      summary: {
        totalMediators: usersWithStats.length,
        pendingCount: pendingRequests.length,
        approvedCount: approvedMediators.length,
        rejectedCount: rejectedMediators.length,
      },
    });
  } catch (err: any) {
    console.error("Error fetching premium users list:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load premium users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { mediatorId, action, reason, isActive } = body;

    if (!mediatorId || !mongoose.Types.ObjectId.isValid(mediatorId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const premiumUser = await User.findById(mediatorId);
    if (!premiumUser || premiumUser.role !== UserRole.PREMIUM_USER) {
      return NextResponse.json({ error: "Premium User not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      premiumUser.mediatorApprovalStatus = "APPROVED";
      premiumUser.isActive = true;
      premiumUser.mediatorApprovedAt = new Date();
      premiumUser.mediatorRejectionReason = undefined;
      await premiumUser.save();

      return NextResponse.json({
        success: true,
        message: `Premium User ${premiumUser.name} approved successfully! They can now log in.`,
        mediator: premiumUser,
      });
    }

    if (action === "REJECT") {
      premiumUser.mediatorApprovalStatus = "REJECTED";
      premiumUser.isActive = false;
      premiumUser.mediatorRejectionReason = reason || "Request rejected by administration";
      await premiumUser.save();

      return NextResponse.json({
        success: true,
        message: `Request for ${premiumUser.name} rejected.`,
        mediator: premiumUser,
      });
    }

    if (action === "RESET_PENDING") {
      premiumUser.mediatorApprovalStatus = "PENDING";
      premiumUser.isActive = false;
      premiumUser.mediatorRejectionReason = undefined;
      await premiumUser.save();

      return NextResponse.json({
        success: true,
        message: `Request for ${premiumUser.name} moved back to Under Verification.`,
        mediator: premiumUser,
      });
    }

    if (action === "TOGGLE_ACTIVE") {
      premiumUser.isActive = typeof isActive === "boolean" ? isActive : !premiumUser.isActive;
      await premiumUser.save();

      return NextResponse.json({
        success: true,
        message: `Premium User status updated to ${premiumUser.isActive ? "Active" : "Disabled"}.`,
        mediator: premiumUser,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error updating premium user:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update premium user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mediatorId = searchParams.get("id");

    if (!mediatorId || !mongoose.Types.ObjectId.isValid(mediatorId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(mediatorId);

    if (!deleted) {
      return NextResponse.json({ error: "Premium User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Premium User record removed successfully`,
    });
  } catch (err: any) {
    console.error("Error deleting premium user:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete premium user" },
      { status: 500 }
    );
  }
}
