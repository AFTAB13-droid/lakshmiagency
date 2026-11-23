import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Deal } from "@/models/Deal";
import { User, UserRole } from "@/models/User";
import { Notification } from "@/models/Notification";

const EXPECTED_SECRET = process.env.GOOGLE_WEBHOOK_SECRET || "lakshmi_agency_secure_webhook_token_2026";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");
    if (secret !== EXPECTED_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
    }

    const body = await req.json();
    const data = body.data || body;

    // Helper to find field value case-insensitively from Google Sheet headers
    const findField = (keywords: string[]): string => {
      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase();
        if (keywords.some((kw) => lowerKey.includes(kw))) {
          return String(data[key]).trim();
        }
      }
      return "";
    };

    const orderId = findField(["order id", "order no", "orderid", "marketplace order", "order"]);
    const productCode = findField(["product code", "deal code", "asin", "product id", "code", "item code"]);
    const mediatorCode = findField(["mediator", "agent", "lax", "premium user", "referral"]);
    const buyerName = findField(["name", "buyer name", "customer name", "your name"]) || "Valued Buyer";
    const buyerPhone = findField(["phone", "whatsapp", "mobile", "contact", "cell", "number"]) || "N/A";
    const buyerEmail = findField(["email", "mail address", "email id"]);
    const screenshot = findField(["screenshot", "image", "drive", "file", "receipt", "proof", "upload"]);

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required in form submission" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if order already exists
    const existingOrder = await Order.findOne({ marketplaceOrderId: orderId });
    if (existingOrder) {
      return NextResponse.json({ message: "Order already registered", orderId: existingOrder._id }, { status: 200 });
    }

    // Lookup Deal
    let deal = null;
    if (productCode) {
      deal = await Deal.findOne({ productCode: productCode.toUpperCase() });
    }

    // If deal found, deduct remaining slot
    if (deal && deal.remainingSlots > 0) {
      deal.remainingSlots -= 1;
      await deal.save();
    }

    // Lookup Mediator (Premium User)
    let mediatorUser = null;
    if (mediatorCode) {
      mediatorUser = await User.findOne({
        role: UserRole.PREMIUM_USER,
        mediatorCode: mediatorCode.toUpperCase(),
      });
    }

    // Lookup Registered Buyer (if already registered on platform)
    let registeredBuyer = null;
    const buyerConditions = [];
    if (buyerEmail) buyerConditions.push({ email: buyerEmail.toLowerCase().trim() });
    if (buyerPhone) buyerConditions.push({ mobile: buyerPhone.trim() });
    if (buyerConditions.length > 0) {
      registeredBuyer = await User.findOne({ $or: buyerConditions });
    }

    // Calculate refund form submission deadline (20 days from now or estimated delivery)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20); // Step 6: 20 days rule

    // Create Order
    const newOrder = await Order.create({
      marketplaceOrderId: orderId,
      dealId: deal?._id,
      productCode: productCode ? productCode.toUpperCase() : "GENERAL",
      productName: deal?.productName || "Marketplace Product",
      brandName: deal?.brandName || "General Brand",
      marketplace: deal?.marketplace || "Amazon",
      amount: deal?.price || 0,
      payoutAmount: deal?.lessAmount || 0,
      buyer: registeredBuyer?._id,
      buyerName,
      buyerPhone,
      buyerEmail,
      orderScreenshotUrl: screenshot,
      mediator: mediatorUser?._id,
      mediatorCode: mediatorCode ? mediatorCode.toUpperCase() : "DIRECT",
      status: OrderStatus.ORDER_FILLED,
      orderDate: new Date(),
      refundFormDeadline: deadline,
    });

    // Send In-App Notification to Buyer (if registered)
    if (registeredBuyer) {
      await Notification.create({
        recipient: registeredBuyer._id,
        recipientRole: "USER",
        title: "📦 Order Synced Successfully!",
        message: `Your Order #${orderId} for ${deal?.productName || "Product"} has been recorded from the Order Form. You can track countdown and refund status here.`,
        type: "ORDER_CREATED",
        link: "/buyer",
      });
    }

    // Send In-App Notification to Mediator
    if (mediatorUser) {
      await Notification.create({
        recipient: mediatorUser._id,
        recipientRole: "PREMIUM_USER",
        title: "📦 New Order Received!",
        message: `Order #${orderId} was submitted by ${buyerName} for ${deal?.productName || "deal"}. Slots remaining: ${deal ? deal.remainingSlots : "N/A"}.`,
        type: "ORDER_CREATED",
        link: `/mediator/orders`,
      });
    }

    // Send In-App Notification to Admins
    const admins = await User.find({ role: UserRole.ADMIN });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        recipientRole: "ADMIN",
        title: "🛒 New Form Order Received",
        message: `Order #${orderId} submitted for ${deal?.brandName || "Brand"}. Assigned to: ${mediatorCode || "Unassigned"}.`,
        type: "ORDER_CREATED",
        link: `/admin/orders`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order received and synced into Lakshmi Agency database",
      orderId: newOrder._id,
      slotsRemaining: deal?.remainingSlots,
    });
  } catch (error: any) {
    console.error("Order webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
