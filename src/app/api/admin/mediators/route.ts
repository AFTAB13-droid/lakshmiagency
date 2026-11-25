import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User, UserRole, MediatorApprovalStatus } from "@/models/User";
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

    // Query all mediators
    const rawMediators = await User.find({ role: UserRole.PREMIUM_USER })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Extract all mediator IDs and codes for efficient bulk order aggregation
    const mediatorIds = rawMediators.map((m) => m._id);
    const mediatorCodes = rawMediators
      .map((m) => m.mediatorCode?.toUpperCase())
      .filter(Boolean);

    // Aggregate orders assigned to these mediators
    const ordersAgg = await Order.aggregate([
      {
        $match: {
          $or: [
            { mediator: { $in: mediatorIds } },
            { mediatorCode: { $in: mediatorCodes } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $ifNull: ["$mediatorCode", "$mediator"],
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ["$payoutAmount", "$amount"] } },
          approvedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED_AND_PAID"] }, 1, 0] },
          },
          pendingOrders: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["ORDER_FILLED", "HOLDING_PERIOD", "REFUND_FORM_FILLED"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Map order metrics by code and by ID
    const statsMap: Record<string, any> = {};
    ordersAgg.forEach((item) => {
      const key = String(item._id).toUpperCase();
      statsMap[key] = {
        totalOrders: item.totalOrders || 0,
        totalAmount: item.totalAmount || 0,
        approvedOrders: item.approvedOrders || 0,
        pendingOrders: item.pendingOrders || 0,
      };
    });

    // Attach order stats and normalized approval status
    const mediatorsWithStats = rawMediators.map((m) => {
      const codeKey = m.mediatorCode?.toUpperCase() || "";
      const idKey = String(m._id).toUpperCase();
      const stats = statsMap[codeKey] || statsMap[idKey] || {
        totalOrders: 0,
        totalAmount: 0,
        approvedOrders: 0,
        pendingOrders: 0,
      };

      // Default existing mediators without status to APPROVED
      const status = m.mediatorApprovalStatus || "APPROVED";

      return {
        ...m,
        mediatorApprovalStatus: status,
        stats,
      };
    });

    const pendingRequests = mediatorsWithStats.filter(
      (m) => m.mediatorApprovalStatus === "PENDING"
    );
    const approvedMediators = mediatorsWithStats.filter(
      (m) => m.mediatorApprovalStatus === "APPROVED"
    );
    const rejectedMediators = mediatorsWithStats.filter(
      (m) => m.mediatorApprovalStatus === "REJECTED"
    );

    return NextResponse.json({
      success: true,
      pendingRequests,
      approvedMediators,
      rejectedMediators,
      allMediators: mediatorsWithStats,
      summary: {
        totalMediators: mediatorsWithStats.length,
        pendingCount: pendingRequests.length,
        approvedCount: approvedMediators.length,
        rejectedCount: rejectedMediators.length,
      },
    });
  } catch (err: any) {
    console.error("Error fetching mediators list:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load mediators" },
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
    const { mediatorId, action, reason, mediatorCode, isActive } = body;

    if (!mediatorId || !mongoose.Types.ObjectId.isValid(mediatorId)) {
      return NextResponse.json({ error: "Invalid mediator ID" }, { status: 400 });
    }

    await connectToDatabase();

    const mediator = await User.findById(mediatorId);
    if (!mediator || mediator.role !== UserRole.PREMIUM_USER) {
      return NextResponse.json({ error: "Mediator not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Ensure a valid mediatorCode exists
      let finalCode = mediatorCode ? mediatorCode.toUpperCase().trim() : mediator.mediatorCode;
      if (!finalCode) {
        const count = await User.countDocuments({ role: UserRole.PREMIUM_USER });
        finalCode = `LAX${String(count + 1).padStart(3, "0")}`;
      }

      mediator.mediatorApprovalStatus = "APPROVED";
      mediator.isActive = true;
      mediator.mediatorCode = finalCode;
      mediator.mediatorApprovedAt = new Date();
      mediator.mediatorRejectionReason = undefined;
      await mediator.save();

      return NextResponse.json({
        success: true,
        message: `Mediator ${mediator.name} (${finalCode}) approved successfully! They can now log in.`,
        mediator,
      });
    }

    if (action === "REJECT") {
      mediator.mediatorApprovalStatus = "REJECTED";
      mediator.isActive = false;
      mediator.mediatorRejectionReason = reason || "Request rejected by administration";
      await mediator.save();

      return NextResponse.json({
        success: true,
        message: `Mediator request for ${mediator.name} rejected.`,
        mediator,
      });
    }

    if (action === "RESET_PENDING") {
      mediator.mediatorApprovalStatus = "PENDING";
      mediator.isActive = false;
      mediator.mediatorRejectionReason = undefined;
      await mediator.save();

      return NextResponse.json({
        success: true,
        message: `Mediator request for ${mediator.name} moved back to Under Verification.`,
        mediator,
      });
    }

    if (action === "TOGGLE_ACTIVE") {
      mediator.isActive = typeof isActive === "boolean" ? isActive : !mediator.isActive;
      await mediator.save();

      return NextResponse.json({
        success: true,
        message: `Mediator status updated to ${mediator.isActive ? "Active" : "Disabled"}.`,
        mediator,
      });
    }

    if (action === "UPDATE_CODE") {
      if (!mediatorCode || !mediatorCode.trim()) {
        return NextResponse.json({ error: "Mediator code is required" }, { status: 400 });
      }
      const newCode = mediatorCode.toUpperCase().trim();
      const duplicate = await User.findOne({
        _id: { $ne: mediator._id },
        role: UserRole.PREMIUM_USER,
        mediatorCode: newCode,
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Code #${newCode} is already assigned to ${duplicate.name}` },
          { status: 400 }
        );
      }

      const oldCode = mediator.mediatorCode;
      mediator.mediatorCode = newCode;
      await mediator.save();

      // Sync existing orders linked to this mediator or matching the new/old code
      const syncConditions: any[] = [{ mediator: mediator._id }, { mediatorCode: newCode }];
      if (oldCode) syncConditions.push({ mediatorCode: oldCode });
      await Order.updateMany(
        { $or: syncConditions },
        { $set: { mediator: mediator._id, mediatorCode: newCode } }
      );

      return NextResponse.json({
        success: true,
        message: `Mediator code updated to #${newCode} and synced across orders`,
        mediator,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error updating mediator:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update mediator" },
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
      return NextResponse.json({ error: "Invalid mediator ID" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(mediatorId);

    if (!deleted) {
      return NextResponse.json({ error: "Mediator not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Mediator record removed successfully`,
    });
  } catch (err: any) {
    console.error("Error deleting mediator:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete mediator" },
      { status: 500 }
    );
  }
}
