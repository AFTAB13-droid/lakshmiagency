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
        const deal = await Deal.findById(order.dealId);
        if (deal) {
          deal.remainingReview = Math.min(deal.reviewSlots, deal.remainingReview + 1);
          deal.remainingSlots = deal.remainingReview + deal.remainingRating;
          if (deal.remainingSlots > 0) {
            deal.isActive = true;
          }
          await deal.save();
        }
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
    } else if (previousStatus === OrderStatus.REJECTED && status !== OrderStatus.REJECTED) {
      // Re-activating order: re-deduct 1 slot
      if (order.dealId) {
        const deal = await Deal.findById(order.dealId);
        if (deal && deal.remainingSlots > 0) {
          if (deal.remainingReview > 0) {
            deal.remainingReview -= 1;
          } else if (deal.remainingRating > 0) {
            deal.remainingRating -= 1;
          }
          deal.remainingSlots = deal.remainingReview + deal.remainingRating;
          if (deal.remainingSlots <= 0) {
            deal.isActive = false;
          }
          await deal.save();
        }
      }
    }

    await order.save();
    return NextResponse.json({ success: true, order });
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
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body.id || body._id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order was consuming a slot (not REJECTED or CANCELLED), restore slot back to deal
    if (order.dealId && order.status !== OrderStatus.REJECTED && order.status !== OrderStatus.CANCELLED) {
      const deal = await Deal.findById(order.dealId);
      if (deal) {
        deal.remainingReview = Math.min(deal.reviewSlots, deal.remainingReview + 1);
        deal.remainingSlots = deal.remainingReview + deal.remainingRating;
        if (deal.remainingSlots > 0) {
          deal.isActive = true;
        }
        await deal.save();
      }
    }

    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Order deleted and stock replenished" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
