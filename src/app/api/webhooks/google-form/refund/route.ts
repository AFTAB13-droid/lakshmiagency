import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Notification } from "@/models/Notification";
import { addWorkingDays } from "@/lib/workingDays";

const EXPECTED_SECRET = process.env.GOOGLE_WEBHOOK_SECRET || "lakshmi_agency_secure_webhook_token_2026";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");
    if (secret !== EXPECTED_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
    }

    const body = await req.json();
    const data = body.data || body;

    // Helper to find field value case-insensitively
    const findField = (keywords: string[]): string => {
      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase();
        if (keywords.some((kw) => lowerKey.includes(kw))) {
          return String(data[key]).trim();
        }
      }
      return "";
    };

    const orderId = findField(["order id", "order no", "orderid", "marketplace order"]);
    const upiId = findField(["upi", "gpay", "phonepe", "paytm", "vpa"]);
    const reviewProof = findField(["review screenshot", "review proof", "screenshot", "drive", "file", "rating"]);
    const bankDetails = findField(["bank", "account number", "ifsc"]);

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required to map refund form" }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({ marketplaceOrderId: orderId });
    if (!order) {
      return NextResponse.json({
        warning: "Order ID not found in database. Please verify Order ID.",
        orderId,
      }, { status: 404 });
    }

    // Step 7: 20-25 Working Days Payout Calculation (default 22 working days)
    const now = new Date();
    const expectedPayout = addWorkingDays(now, 22);

    order.status = OrderStatus.REFUND_FORM_FILLED;
    order.refundFormSubmittedAt = now;
    order.expectedPayoutDate = expectedPayout;
    if (reviewProof) {
      order.reviewScreenshotUrl = reviewProof;
    }
    if (upiId) {
      order.upiId = upiId;
    }
    if (upiId || bankDetails) {
      order.notes = `Payout Details: UPI=${upiId || "N/A"}, Bank=${bankDetails || "N/A"}`;
    }

    // Attempt to link buyer if not already linked
    if (!order.buyer) {
      const { User } = await import("@/models/User");
      const buyerMatch = await User.findOne({
        $or: [
          { email: order.buyerEmail?.toLowerCase().trim() },
          { mobile: order.buyerPhone?.trim() },
        ],
      });
      if (buyerMatch) {
        order.buyer = buyerMatch._id;
      }
    }

    await order.save();

    // In-App Notification to Buyer (if registered)
    if (order.buyer) {
      await Notification.create({
        recipient: order.buyer,
        recipientRole: "USER",
        title: "✅ Refund Form Received!",
        message: `Your Google Refund Form for Order #${orderId} was mapped successfully. Admin will review proof for payout.`,
        type: "REFUND_SUBMITTED",
        link: "/buyer",
      });
    }

    // In-App Notification to Mediator
    if (order.mediator) {
      await Notification.create({
        recipient: order.mediator,
        recipientRole: "PREMIUM_USER",
        title: "💰 Refund Form Filled!",
        message: `Buyer for Order #${orderId} has submitted the refund form. Proof is ready for review.`,
        type: "REFUND_SUBMITTED",
        link: `/mediator/orders`,
      });
    }

    // In-App Notification to Admin
    const admins = await connectToDatabase().then(() =>
      import("@/models/User").then((m) => m.User.find({ role: "ADMIN" }))
    );
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        recipientRole: "ADMIN",
        title: "💵 Refund Form Submitted",
        message: `Order #${orderId} refund form submitted. Payout expected within 22 working days.`,
        type: "REFUND_SUBMITTED",
        link: `/admin/orders`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Refund form mapped successfully. Expected payout window initialized.",
      orderId: order._id,
      expectedPayoutDate: expectedPayout,
    });
  } catch (error: any) {
    console.error("Refund webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
