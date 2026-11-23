import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "PREMIUM_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // @ts-ignore
    const userId = session.user.id;
    // @ts-ignore
    const mediatorCode = session.user.mediatorCode;

    // Find orders assigned by user ID or mediatorCode
    const orders = await Order.find({
      $or: [{ mediator: userId }, { mediatorCode: mediatorCode?.toUpperCase() }],
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "PREMIUM_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, notes } = await req.json();
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;
    if (notes) order.notes = notes;
    if (status === OrderStatus.APPROVED_AND_PAID) {
      order.paidAt = new Date();
    }
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
