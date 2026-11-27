import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Deal } from "@/models/Deal";
import { User, UserRole } from "@/models/User";
import { Notification } from "@/models/Notification";
import { Brand } from "@/models/Brand";
import {
  resolveMediatorFromInput,
  findOrderByNormalizedId,
  calculateDealPayout,
} from "@/lib/webhookHelpers";

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
    const findField = (keywords: string[], excludeKeywords: string[] = []): string => {
      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase();
        if (excludeKeywords.some((ex) => lowerKey.includes(ex))) {
          continue;
        }
        if (keywords.some((kw) => lowerKey.includes(kw))) {
          const val = String(data[key]).trim();
          if (val) return val;
        }
      }
      return "";
    };

    // 1. Precise Field Extraction
    const orderId = findField([
      "order id",
      "order no",
      "orderid",
      "marketplace order",
      "order number",
      "order",
    ]);

    const productCode = findField([
      "product code",
      "deal code",
      "asin",
      "sku",
      "product id",
      "item code",
      "code",
    ]);

    const productNameInput = findField([
      "product name",
      "product title",
      "product ordered",
      "select product",
      "which product",
      "item name",
      "product",
      "item",
      "deal",
    ]);

    const brandNameInput = findField(
      [
        "brand name",
        "brand",
        "product brand",
        "brand / seller",
        "brand / company",
        "brand / manufacturer",
        "seller name",
        "seller",
        "company",
        "manufacturer",
        "make",
      ],
      ["order", "id", "asin", "sku", "phone", "email", "link", "url", "proof", "screenshot"]
    );

    const slotTypeInput = findField([
      "slot type",
      "review or rating",
      "rating or review",
      "type of slot",
      "review type",
      "feedback type",
    ]);

    const mediatorCode = findField([
      "mediator",
      "agent",
      "lax",
      "premium user",
      "referral",
      "agent code",
      "mediator code",
    ]);

    // Ensure phone matcher NEVER captures "Order Number"
    const buyerPhone =
      findField(
        ["phone", "whatsapp", "mobile", "contact", "cell"],
        ["order", "asin", "sku", "product", "deal", "id"]
      ) || "N/A";

    const buyerName =
      findField(
        ["name", "buyer name", "customer name", "your name", "full name"],
        ["product", "brand", "item", "deal"]
      ) || "Valued Buyer";

    const buyerEmail = findField(["email", "mail address", "email id", "gmail"]);
    const screenshot = findField(["screenshot", "image", "drive", "file", "receipt", "proof", "upload", "attachment"]);

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required in form submission" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if order already exists (normalized)
    const existingOrder = await findOrderByNormalizedId(orderId);
    if (existingOrder) {
      return NextResponse.json({ message: "Order already registered", orderId: existingOrder._id }, { status: 200 });
    }

    // =========================================================================
    // 2. Multi-Tier Deal Matcher (Guarantees matching for registered & unregistered buyers)
    // =========================================================================
    let deal = null;

    // Tier 1: Try by exact productCode
    if (productCode) {
      deal = await Deal.findOne({ productCode: productCode.toUpperCase() });
    }

    // Tier 2: Try by exact productName (case-insensitive regex)
    if (!deal && (productNameInput || productCode)) {
      const targetName = (productNameInput || productCode).trim();
      const escaped = targetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      deal = await Deal.findOne({ productName: { $regex: new RegExp(`^${escaped}$`, "i") } });
    }

    // Tier 3: Substring & Keyword scoring across all deals
    if (!deal && (productNameInput || productCode)) {
      const queryText = (productNameInput || productCode).toLowerCase();
      const allDeals = await Deal.find({});
      for (const d of allDeals) {
        const dName = d.productName.toLowerCase();
        const dCode = d.productCode.toLowerCase();
        const dBrand = d.brandName.toLowerCase();
        if (
          queryText.includes(dCode) ||
          dName.includes(queryText) ||
          queryText.includes(dName) ||
          (queryText.includes(dBrand) && dName.split(" ").some((w) => w.length > 3 && queryText.includes(w)))
        ) {
          deal = d;
          break;
        }
      }
    }

    // Tier 4: Look for Amazon ASIN or product link embedded in any submitted field
    if (!deal) {
      const allDeals = await Deal.find({});
      for (const d of allDeals) {
        if (d.productLink) {
          const asinMatch = d.productLink.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
          const asin = asinMatch ? asinMatch[1].toUpperCase() : null;
          for (const key of Object.keys(data)) {
            const val = String(data[key]).toUpperCase();
            if (asin && val.includes(asin)) {
              deal = d;
              break;
            }
          }
        }
        if (deal) break;
      }
    }

    // =========================================================================
    // 3. Atomic Race-Condition Guard & Sold-Out Prevention
    // =========================================================================
    let slotDeducted = false;
    let isOverbooked = false;

    if (deal) {
      // If deal is already completed (0 slots), strictly block overbooking
      if (deal.remainingSlots <= 0) {
        isOverbooked = true;
      } else {
        // Determine whether to deduct Review, Rating, or Order Only bucket
        const normalizedSlot = (slotTypeInput || "").toLowerCase();
        const isRatingExplicit = normalizedSlot.includes("rating");
        const isOrderOnlyExplicit = normalizedSlot.includes("order only") || normalizedSlot.includes("order_only") || normalizedSlot === "order";
        const preferBucket = isOrderOnlyExplicit
          ? "remainingOrderOnly"
          : isRatingExplicit
          ? "remainingRating"
          : "remainingReview";
        const fallbackBuckets = ["remainingReview", "remainingRating", "remainingOrderOnly"].filter(
          (b) => b !== preferBucket
        );

        // ATOMIC LOCK & DECREMENT:
        // MongoDB conditional findOneAndUpdate ensures two users submitting at the exact same
        // millisecond for 1 slot will NEVER overbook or cause negative slots!
        let updatedDeal = await Deal.findOneAndUpdate(
          {
            _id: deal._id,
            remainingSlots: { $gt: 0 },
            [preferBucket]: { $gt: 0 },
          },
          {
            $inc: {
              [preferBucket]: -1,
              remainingSlots: -1,
            },
          },
          { new: true }
        );

        // Fallback to alternate buckets if preferred bucket was 0
        for (const fallbackBucket of fallbackBuckets) {
          if (updatedDeal) break;
          updatedDeal = await Deal.findOneAndUpdate(
            {
              _id: deal._id,
              remainingSlots: { $gt: 0 },
              [fallbackBucket]: { $gt: 0 },
            },
            {
              $inc: {
                [fallbackBucket]: -1,
                remainingSlots: -1,
              },
            },
            { new: true }
          );
        }

        if (updatedDeal) {
          slotDeducted = true;
          deal = updatedDeal;

          // If this order took the very last slot (remainingSlots reached 0)
          if (deal.remainingSlots <= 0) {
            // Automatically mark deal as archived/inactive
            await Deal.findByIdAndUpdate(deal._id, { isActive: false });

            // Notify all administrators about Deal Sold Out
            const admins = await User.find({ role: UserRole.ADMIN });
            for (const admin of admins) {
              await Notification.create({
                recipient: admin._id,
                recipientRole: "ADMIN",
                title: `🚨 Deal Sold Out: #${deal.productCode}`,
                message: `All ${deal.totalSlots} slots for "${deal.productName}" (${deal.brandName}) have been completed! Deal moved to Archived Studio.`,
                type: "DEAL_SOLD_OUT",
                link: `/admin/deals?tab=archived`,
              });
            }
          }
        } else {
          // A concurrent user grabbed the final slot first -> Overbooked
          isOverbooked = true;
        }
      }
    }

    // =========================================================================
    // 4. Resolve Mediator & Buyer (Registered or Unregistered)
    // =========================================================================
    const { mediatorUser, resolvedMediatorCode } = await resolveMediatorFromInput(mediatorCode);

    let registeredBuyer = null;
    const buyerConditions = [];
    if (buyerEmail) buyerConditions.push({ email: buyerEmail.toLowerCase().trim() });
    if (buyerPhone && buyerPhone !== "N/A") buyerConditions.push({ mobile: buyerPhone.trim() });
    if (buyerConditions.length > 0) {
      registeredBuyer = await User.findOne({ $or: buyerConditions });
    }

    // 20 days refund window
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20);

    // =========================================================================
    // 4.5. Multi-Source Brand Resolution Engine
    // =========================================================================
    let resolvedBrandName = "";

    // Source 1: Direct from Matched Deal (highest confidence)
    if (deal?.brandName && deal.brandName.trim().length > 0) {
      resolvedBrandName = deal.brandName.trim();
    }

    // Source 2: Direct from Google Form "Brand" Field Submission
    if (!resolvedBrandName && brandNameInput && brandNameInput.trim().length > 0) {
      resolvedBrandName = brandNameInput.trim();
    }

    // Source 3: Match against Registered Brands Catalog in Database
    const allDbBrands = await Brand.find({ isActive: true });
    if (!resolvedBrandName && (productNameInput || productCode)) {
      const fullQuery = `${productNameInput} ${productCode}`.toLowerCase();
      for (const b of allDbBrands) {
        if (fullQuery.includes(b.name.toLowerCase())) {
          resolvedBrandName = b.name;
          break;
        }
      }
    }

    // Source 4: Parse Brand from E-Commerce Product Title (Amazon / Flipkart format)
    // Standard marketplace titles: "[BrandName] [Item Description...]"
    if (!resolvedBrandName && productNameInput) {
      const cleanTitle = productNameInput.trim().replace(/^[^a-zA-Z0-9]+/, "");
      const words = cleanTitle.split(/\s+/);
      if (words.length > 0) {
        const firstWord = words[0].replace(/[^a-zA-Z0-9&.-]/g, "");
        const secondWord = words.length > 1 ? words[1].replace(/[^a-zA-Z0-9&.-]/g, "") : "";
        const stopWords = new Set(["the", "a", "an", "new", "all", "best", "hot", "pack", "set", "original", "premium", "top", "latest"]);

        if (firstWord && firstWord.length >= 2) {
          const twoWord = `${firstWord} ${secondWord}`.trim();
          const matchTwoWord = allDbBrands.find((b) => b.name.toLowerCase() === twoWord.toLowerCase());
          if (matchTwoWord) {
            resolvedBrandName = matchTwoWord.name;
          } else if (!stopWords.has(firstWord.toLowerCase())) {
            resolvedBrandName = firstWord;
          } else if (secondWord && !stopWords.has(secondWord.toLowerCase())) {
            resolvedBrandName = `${firstWord} ${secondWord}`;
          }
        }
      }
    }

    // Source 5: Clean fallback if completely unresolved
    if (!resolvedBrandName || resolvedBrandName.toLowerCase() === "general brand") {
      resolvedBrandName = "General Brand";
    }

    // Auto-register newly discovered brand if valid and not existing
    if (resolvedBrandName && resolvedBrandName !== "General Brand") {
      try {
        const escapedBrand = resolvedBrandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await Brand.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${escapedBrand}$`, "i") } },
          { $setOnInsert: { name: resolvedBrandName, isActive: true } },
          { upsert: true }
        );
      } catch (err) {}
    }

    // =========================================================================
    // 5. Create Order Record
    // =========================================================================
    const orderStatus = isOverbooked ? OrderStatus.REJECTED : OrderStatus.ORDER_FILLED;
    const rejectionReason = isOverbooked
      ? "OVERBOOKED: All available review slots for this deal were completed prior to submission."
      : "";

    const normalizedSlotInput = (slotTypeInput || "").toLowerCase();
    const feedbackMode: "REVIEW" | "RATING" | "ORDER_ONLY" =
      normalizedSlotInput.includes("order only") || normalizedSlotInput.includes("order_only") || normalizedSlotInput === "order"
        ? "ORDER_ONLY"
        : normalizedSlotInput.includes("rating")
        ? "RATING"
        : "REVIEW";
    const computedPayout = calculateDealPayout(deal, feedbackMode);

    const newOrder = await Order.create({
      marketplaceOrderId: orderId.trim(),
      dealId: deal?._id,
      productCode: deal?.productCode || (productCode ? productCode.toUpperCase() : "GENERAL"),
      productName: deal?.productName || productNameInput || "Marketplace Product",
      brandName: resolvedBrandName,
      marketplace: deal?.marketplace || "Amazon",
      amount: deal?.price || 0,
      payoutAmount: computedPayout,
      buyer: registeredBuyer?._id,
      buyerName,
      buyerPhone,
      buyerEmail,
      orderScreenshotUrl: screenshot,
      mediator: mediatorUser?._id,
      mediatorCode: resolvedMediatorCode,
      status: orderStatus,
      rejectionReason,
      notes: isOverbooked ? "Order rejected because deal inventory was 0." : "",
      orderDate: new Date(),
      refundFormDeadline: deadline,
    });

    // =========================================================================
    // 6. In-App Notifications
    // =========================================================================
    if (isOverbooked) {
      // Overbook alert to Admins
      const admins = await User.find({ role: UserRole.ADMIN });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          recipientRole: "ADMIN",
          title: `⚠️ Overbook Prevented: Order #${orderId}`,
          message: `Buyer ${buyerName} tried to submit Order #${orderId} for "${deal?.productName || "Product"}", but all slots are already completed. Order was automatically flagged as rejected.`,
          type: "ORDER_REJECTED",
          link: `/admin/orders`,
        });
      }
    } else {
      // Normal order notifications
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

      if (mediatorUser) {
        await Notification.create({
          recipient: mediatorUser._id,
          recipientRole: "PREMIUM_USER",
          title: "📦 New Order Received!",
          message: `Order #${orderId} submitted by ${buyerName} for ${deal?.productName || "deal"}. Slots remaining: ${deal ? deal.remainingSlots : "N/A"}.`,
          type: "ORDER_CREATED",
          link: `/mediator/orders`,
        });
      }

      const admins = await User.find({ role: UserRole.ADMIN });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          recipientRole: "ADMIN",
          title: "🛒 New Form Order Received",
          message: `Order #${orderId} submitted for ${deal?.brandName || "Brand"}. Assigned to: ${mediatorCode || "Unassigned"}. Slots left: ${deal?.remainingSlots ?? "N/A"}.`,
          type: "ORDER_CREATED",
          link: `/admin/orders`,
        });
      }
    }

    return NextResponse.json({
      success: !isOverbooked,
      message: isOverbooked
        ? "Slots for this deal were already full. Order registered as overbooked."
        : "Order received and synced into Lakshmi Agency database",
      orderId: newOrder._id,
      dealMatched: !!deal,
      dealProductCode: deal?.productCode,
      slotsRemaining: deal?.remainingSlots,
      slotDeducted,
      isOverbooked,
    });
  } catch (error: any) {
    console.error("Order webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
