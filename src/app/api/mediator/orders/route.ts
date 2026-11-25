import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { findOrderByNormalizedId } from "@/lib/webhookHelpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.email || session.user?.role !== "PREMIUM_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const email = session.user.email.toLowerCase().trim();
    const currentUser = await User.findOne({ email }).select("mobile name _id").lean();

    const matchConditions: any[] = [{ buyerEmail: email }];
    if (currentUser?._id) {
      matchConditions.push({ buyer: currentUser._id });
    }
    if (currentUser?.mobile) {
      const cleanDigits = currentUser.mobile.replace(/\D/g, "").slice(-10);
      matchConditions.push({ buyerPhone: currentUser.mobile });
      if (cleanDigits.length === 10) {
        matchConditions.push({ buyerPhone: { $regex: `${cleanDigits}$` } });
      }
    }

    // Fetch only Order & Refund Forms filled by this Premium User themselves
    const orders = await Order.find({ $or: matchConditions })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 1-Click Claim Order by Order ID (if Premium User used a different email/phone on Google Form)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.email || session.user?.role !== "PREMIUM_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId || !orderId.trim()) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const email = session.user.email.toLowerCase().trim();
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const order = await findOrderByNormalizedId(orderId.trim());
    if (!order) {
      return NextResponse.json(
        {
          error: `Order #${orderId.trim()} not found. Please confirm the Google Order Form was submitted.`,
        },
        { status: 404 }
      );
    }

    order.buyer = currentUser._id;
    if (!order.buyerEmail) order.buyerEmail = email;
    if (!order.buyerPhone && currentUser.mobile) order.buyerPhone = currentUser.mobile;
    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order #${order.marketplaceOrderId} linked to your Premium User account!`,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
