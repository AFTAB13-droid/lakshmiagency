import { User, UserRole } from "@/models/User";
import { Order } from "@/models/Order";

/**
 * Resolves a mediator from raw Google Form input (code, "Name (CODE)", name, or phone).
 */
export async function resolveMediatorFromInput(rawInput?: string) {
  const input = (rawInput || "").trim();
  if (!input || ["direct", "none", "self", "n/a", "na", "-"].includes(input.toLowerCase())) {
    return { mediatorUser: null, resolvedMediatorCode: "DIRECT" };
  }

  // Extract code from formats like "Karthick (SK)" or "#SK"
  const parenMatch = input.match(/\(([^)]+)\)/);
  const hashMatch = input.match(/#([a-zA-Z0-9_-]+)/);
  const candidateCodes = [
    input.toUpperCase(),
    parenMatch ? parenMatch[1].trim().toUpperCase() : "",
    hashMatch ? hashMatch[1].trim().toUpperCase() : "",
  ].filter(Boolean);

  const mediators = await User.find({ role: UserRole.PREMIUM_USER });

  // Tier 1: Exact mediatorCode match
  let matched = mediators.find(
    (m) => m.mediatorCode && candidateCodes.includes(m.mediatorCode.toUpperCase().trim())
  );

  // Tier 2: Case-insensitive Name match (e.g. "Karthick" -> SK)
  if (!matched) {
    const lowerInput = input.toLowerCase();
    matched = mediators.find((m) => {
      const mName = (m.name || "").toLowerCase().trim();
      return mName && (mName === lowerInput || lowerInput.includes(mName));
    });
  }

  // Tier 3: Mobile number match (last 10 digits)
  if (!matched) {
    const digits = input.replace(/\D/g, "").slice(-10);
    if (digits.length === 10) {
      matched = mediators.find((m) => (m.mobile || "").replace(/\D/g, "").slice(-10) === digits);
    }
  }

  if (matched) {
    return {
      mediatorUser: matched,
      resolvedMediatorCode: (matched.mediatorCode || input).toUpperCase().trim(),
    };
  }

  return {
    mediatorUser: null,
    resolvedMediatorCode: input.toUpperCase().trim(),
  };
}

/**
 * Finds an Order by marketplaceOrderId with resilient normalization
 * (handles extra spaces, case differences, marketplace prefixes, or missing hyphens).
 */
export async function findOrderByNormalizedId(rawOrderId: string) {
  const clean = rawOrderId.trim();
  if (!clean) return null;

  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let order = await Order.findOne({
    marketplaceOrderId: { $regex: new RegExp(`^${escaped}$`, "i") },
  });
  if (order) return order;

  // Strip common prefixes like "Amazon ", "Flipkart ", "#"
  const strippedPrefix = clean.replace(/^(amazon|flipkart|myntra|meesho|ajio|order\s*id|#|:|\s)+/i, "").trim();
  if (strippedPrefix && strippedPrefix !== clean) {
    const escapedStripped = strippedPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    order = await Order.findOne({
      marketplaceOrderId: { $regex: new RegExp(`^${escapedStripped}$`, "i") },
    });
    if (order) return order;
  }

  // Fallback: Alphanumeric comparison (ignores hyphens & spaces) across recent orders
  const alphaTarget = strippedPrefix.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alphaTarget.length >= 6) {
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(500);
    for (const o of recentOrders) {
      const oAlpha = (o.marketplaceOrderId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (oAlpha === alphaTarget) {
        return o;
      }
    }
  }

  return null;
}

/**
 * Computes expected payout amount from Deal's per-feedback-type pricing.
 */
export function calculateDealPayout(deal: any, feedbackTypeOrIsRating: boolean | "REVIEW" | "RATING" | "ORDER_ONLY"): number {
  if (!deal) return 0;
  const price = Number(deal.price) || 0;
  const mode =
    typeof feedbackTypeOrIsRating === "boolean"
      ? feedbackTypeOrIsRating
        ? "RATING"
        : "REVIEW"
      : feedbackTypeOrIsRating;

  const pType =
    mode === "RATING"
      ? deal.ratingPricingType || deal.pricingType
      : mode === "ORDER_ONLY"
      ? deal.orderOnlyPricingType || deal.pricingType
      : deal.reviewPricingType || deal.pricingType;

  if (pType === "LESS") {
    const less =
      mode === "RATING"
        ? Number(deal.ratingLessAmount ?? deal.lessAmount) || 0
        : mode === "ORDER_ONLY"
        ? Number(deal.orderOnlyLessAmount ?? deal.lessAmount) || 0
        : Number(deal.reviewLessAmount ?? deal.lessAmount) || 0;
    return Math.max(0, price - less);
  }
  if (pType === "COMMISSION") {
    const comm =
      mode === "RATING"
        ? Number(deal.ratingCommissionAmount ?? deal.commissionAmount) || 0
        : mode === "ORDER_ONLY"
        ? Number(deal.orderOnlyCommissionAmount ?? deal.commissionAmount) || 0
        : Number(deal.reviewCommissionAmount ?? deal.commissionAmount) || 0;
    return price + comm;
  }
  return price;
}

/**
 * Fetches orders belonging to a user (Premium User / Buyer) with Mobile-First priority:
 * 1. Check mobile number match (+ explicitly linked buyer: user._id).
 * 2. ONLY if no orders matched mobile/userId, fall back to email ID match.
 */
export async function getSelfUserOrders(user: {
  _id?: any;
  email?: string;
  mobile?: string;
}) {
  const email = (user.email || "").toLowerCase().trim();
  const rawMobile = (user.mobile || "").trim();
  const cleanDigits = rawMobile.replace(/\D/g, "").slice(-10);

  const primaryConditions: any[] = [];
  if (user._id) primaryConditions.push({ buyer: user._id });
  if (rawMobile) primaryConditions.push({ buyerPhone: rawMobile });
  if (cleanDigits.length === 10) {
    primaryConditions.push({ buyerPhone: { $regex: `${cleanDigits}$` } });
  }

  if (primaryConditions.length > 0) {
    const mobileOrLinkedOrders = await Order.find({ $or: primaryConditions })
      .sort({ createdAt: -1 })
      .lean();

    if (mobileOrLinkedOrders.length > 0) {
      return mobileOrLinkedOrders;
    }
  }

  if (!email) return [];

  return Order.find({ buyerEmail: email }).sort({ createdAt: -1 }).lean();
}

/**
 * In-memory equivalent of getSelfUserOrders for bulk list aggregation.
 */
export function filterSelfUserOrdersFromList(
  allOrders: any[],
  user: { _id?: any; email?: string; mobile?: string }
) {
  const uId = user._id ? String(user._id) : "";
  const uEmail = (user.email || "").toLowerCase().trim();
  const rawMobile = (user.mobile || "").trim();
  const uDigits = rawMobile.replace(/\D/g, "").slice(-10);

  const mobileOrLinked = allOrders.filter((o: any) => {
    if (uId && o.buyer && String(o.buyer) === uId) return true;
    if (rawMobile && (o.buyerPhone || "").trim() === rawMobile) return true;
    if (uDigits.length === 10) {
      const oDigits = (o.buyerPhone || "").replace(/\D/g, "").slice(-10);
      if (oDigits === uDigits) return true;
    }
    return false;
  });

  if (mobileOrLinked.length > 0) {
    return mobileOrLinked;
  }

  if (!uEmail) return [];
  return allOrders.filter(
    (o: any) => (o.buyerEmail || "").toLowerCase().trim() === uEmail
  );
}
