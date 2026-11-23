import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const email = session.user.email.toLowerCase().trim();

    // Fetch user profile to check mobile number for robust matching
    const currentUser = await User.findOne({ email }).select("mobile name _id").lean();

    const matchConditions: any[] = [{ buyerEmail: email }];
    if (currentUser?._id) {
      matchConditions.push({ buyer: currentUser._id });
    }
    if (currentUser?.mobile) {
      matchConditions.push({ buyerPhone: currentUser.mobile });
    }
    if (currentUser?.name) {
      matchConditions.push({ buyerName: currentUser.name });
    }

    // Match orders by buyer email, phone, name, or linked account with fast .lean()
    const orders = await Order.find({ $or: matchConditions })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 1-Click Claim Order by Order ID (handles unregistered user or typo on form)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.email) {
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

    const cleanId = orderId.trim();
    const order = await Order.findOne({
      marketplaceOrderId: { $regex: new RegExp(`^${cleanId}$`, "i") },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: `Order #${cleanId} not found. Please confirm the Google Order Form was submitted.`,
        },
        { status: 404 }
      );
    }

    // Link this order to the current user
    order.buyer = currentUser._id;
    if (!order.buyerEmail) order.buyerEmail = email;
    if (!order.buyerPhone && currentUser.mobile) order.buyerPhone = currentUser.mobile;
    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order #${cleanId} successfully claimed and linked to your account!`,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
