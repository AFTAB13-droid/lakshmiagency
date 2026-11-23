import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Deal } from "@/models/Deal";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
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

    const { orderId, status, transactionReference, rejectionReason, payoutAmount } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status required" }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (payoutAmount !== undefined && payoutAmount !== null) {
      order.payoutAmount = Number(payoutAmount);
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === OrderStatus.APPROVED_AND_PAID) {
      order.paidAt = new Date();
      if (transactionReference) order.transactionReference = transactionReference;
    } else if (status === OrderStatus.REJECTED) {
      order.rejectionReason = rejectionReason || "Rejected by Administration";
      // Auto-restore slot +1 if deal is linked
      if (order.dealId && previousStatus !== OrderStatus.REJECTED) {
        await Deal.findByIdAndUpdate(order.dealId, { $inc: { remainingSlots: 1 } });
      }

      // Find buyer user to send in-app notification
      let buyerUser = null;
      if (order.buyer) {
        buyerUser = await User.findById(order.buyer);
      } else {
        const conds = [];
        if (order.buyerEmail) conds.push({ email: order.buyerEmail.toLowerCase().trim() });
        if (order.buyerPhone) conds.push({ mobile: order.buyerPhone.trim() });
        if (conds.length > 0) {
          buyerUser = await User.findOne({ $or: conds });
        }
      }

      if (buyerUser) {
        await Notification.create({
          recipient: buyerUser._id,
          recipientRole: "USER",
          title: "❌ Form Submission Rejected",
          message: `Your Order #${order.marketplaceOrderId} (${order.productName || "Product"}) was rejected. Reason: ${order.rejectionReason}`,
          type: "ORDER_REJECTED",
          link: "/buyer",
        });
      }

      // Notify Mediator if assigned
      if (order.mediator) {
        await Notification.create({
          recipient: order.mediator,
          recipientRole: "PREMIUM_USER",
          title: "⚠️ Order Rejected by Admin",
          message: `Order #${order.marketplaceOrderId} was marked as REJECTED. Reason: ${order.rejectionReason}`,
          type: "ORDER_REJECTED",
          link: "/mediator/orders",
        });
      }
    }

    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
