import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Deal } from "@/models/Deal";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const deals = await Deal.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, deals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      brandName,
      productName,
      productCode,
      marketplace,
      productLink,
      productImage,
      price,
      pricingType,
      lessAmount,
      commissionAmount,
      reviewPricingType,
      reviewLessAmount,
      reviewCommissionAmount,
      ratingPricingType,
      ratingLessAmount,
      ratingCommissionAmount,
      orderOnlyPricingType,
      orderOnlyLessAmount,
      orderOnlyCommissionAmount,
      reviewDeletePricingType,
      reviewDeleteLessAmount,
      reviewDeleteCommissionAmount,
      reviewSlots,
      ratingSlots,
      orderOnlySlots,
      dealType,
      description,
      instructions,
      paymentTimeline,
      whatsappNumber,
      whatsappMessage,
    } = body;

    const isNoInvestment = dealType === "No Investment";

    const finalBrand = isNoInvestment ? (brandName?.trim() || "Lakshmi Agency") : brandName;
    const finalProduct = isNoInvestment ? (productName?.trim() || "No Investment Deal") : productName;
    const finalCode = (productCode?.trim() || (isNoInvestment ? "NOINV-" + Date.now().toString().slice(-4) : "")).toUpperCase();
    const finalPrice = isNoInvestment ? 0 : Number(price);

    if (!finalBrand || !finalProduct || !finalCode || (finalPrice === undefined || finalPrice === null || isNaN(finalPrice))) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Deal.findOne({ productCode: finalCode });
    if (existing) {
      return NextResponse.json({ error: "Product Code already exists" }, { status: 400 });
    }

    const rSlots = isNoInvestment ? 9999 : (Number(reviewSlots) || 0);
    const ratSlots = isNoInvestment ? 9999 : (Number(ratingSlots) || 0);
    const ooSlots = isNoInvestment ? 0 : (Number(orderOnlySlots) || 0);
    const totalSlots = rSlots + ratSlots + ooSlots;

    // Derive primary fallback pricingType from active feedback type if not explicitly provided
    const revPType = reviewPricingType || pricingType || "FULL_REFUND";
    const revLess = Number(reviewLessAmount ?? lessAmount) || 0;
    const revComm = Number(reviewCommissionAmount ?? commissionAmount) || 0;

    const ratPType = ratingPricingType || pricingType || "FULL_REFUND";
    const ratLess = Number(ratingLessAmount ?? lessAmount) || 0;
    const ratComm = Number(ratingCommissionAmount ?? commissionAmount) || 0;

    const ooPType = orderOnlyPricingType || pricingType || "FULL_REFUND";
    const ooLess = Number(orderOnlyLessAmount ?? lessAmount) || 0;
    const ooComm = Number(orderOnlyCommissionAmount ?? commissionAmount) || 0;

    const primaryPType = isNoInvestment
      ? "FULL_REFUND"
      : rSlots > 0
      ? revPType
      : ratSlots > 0
      ? ratPType
      : ooSlots > 0
      ? ooPType
      : pricingType || "FULL_REFUND";
    const primaryLess = isNoInvestment ? 0 : rSlots > 0 ? revLess : ratSlots > 0 ? ratLess : ooSlots > 0 ? ooLess : Number(lessAmount) || 0;
    const primaryComm = isNoInvestment ? 0 : rSlots > 0 ? revComm : ratSlots > 0 ? ratComm : ooSlots > 0 ? ooComm : Number(commissionAmount) || 0;

    const newDeal = await Deal.create({
      brandName: finalBrand,
      productName: finalProduct,
      productCode: finalCode,
      marketplace: isNoInvestment ? (marketplace || "WhatsApp Direct") : (marketplace || "Amazon"),
      productLink: productLink || "",
      productImage: productImage || (isNoInvestment ? "/logo.jpg" : ""),
      price: finalPrice,
      pricingType: primaryPType,
      lessAmount: primaryLess,
      commissionAmount: primaryComm,
      reviewPricingType: isNoInvestment ? "FULL_REFUND" : revPType,
      reviewLessAmount: isNoInvestment ? 0 : revLess,
      reviewCommissionAmount: isNoInvestment ? 0 : revComm,
      ratingPricingType: isNoInvestment ? "FULL_REFUND" : ratPType,
      ratingLessAmount: isNoInvestment ? 0 : ratLess,
      ratingCommissionAmount: isNoInvestment ? 0 : ratComm,
      orderOnlyPricingType: isNoInvestment ? "FULL_REFUND" : ooPType,
      orderOnlyLessAmount: isNoInvestment ? 0 : ooLess,
      orderOnlyCommissionAmount: isNoInvestment ? 0 : ooComm,
      reviewDeletePricingType: isNoInvestment ? "NONE" : (reviewDeletePricingType || "NONE"),
      reviewDeleteLessAmount: isNoInvestment ? 0 : (Number(reviewDeleteLessAmount) || 0),
      reviewDeleteCommissionAmount: isNoInvestment ? 0 : (Number(reviewDeleteCommissionAmount) || 0),
      totalSlots,
      remainingSlots: totalSlots,
      reviewSlots: rSlots,
      remainingReview: rSlots,
      ratingSlots: ratSlots,
      remainingRating: ratSlots,
      orderOnlySlots: ooSlots,
      remainingOrderOnly: ooSlots,
      dealType: dealType || "Original",
      description: description || "",
      instructions: instructions || "",
      paymentTimeline: paymentTimeline || "",
      whatsappNumber: whatsappNumber || "",
      whatsappMessage: whatsappMessage || "Hey, I want to take the No Investment Deal. Please share details!",
      isActive: true,
    });

    return NextResponse.json({ success: true, deal: newDeal });
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

    const body = await req.json();
    const { id, _id, ...updateData } = body;
    const dealId = id || _id;

    if (!dealId) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // If productCode changed, check duplicate
    if (updateData.productCode && updateData.productCode.toUpperCase() !== deal.productCode) {
      const codeExists = await Deal.findOne({
        _id: { $ne: dealId },
        productCode: updateData.productCode.toUpperCase(),
      });
      if (codeExists) {
        return NextResponse.json({ error: "Product Code already in use by another deal" }, { status: 400 });
      }
      deal.productCode = updateData.productCode.toUpperCase();
    }

    if (updateData.brandName !== undefined) deal.brandName = updateData.brandName;
    if (updateData.productName !== undefined) deal.productName = updateData.productName;
    if (updateData.marketplace !== undefined) deal.marketplace = updateData.marketplace;
    if (updateData.productLink !== undefined) deal.productLink = updateData.productLink;
    if (updateData.productImage !== undefined) deal.productImage = updateData.productImage;
    if (updateData.price !== undefined) deal.price = Number(updateData.price);
    if (updateData.pricingType !== undefined) deal.pricingType = updateData.pricingType;
    if (updateData.lessAmount !== undefined) deal.lessAmount = Number(updateData.lessAmount) || 0;
    if (updateData.commissionAmount !== undefined) deal.commissionAmount = Number(updateData.commissionAmount) || 0;
    if (updateData.reviewPricingType !== undefined) deal.reviewPricingType = updateData.reviewPricingType;
    if (updateData.reviewLessAmount !== undefined) deal.reviewLessAmount = Number(updateData.reviewLessAmount) || 0;
    if (updateData.reviewCommissionAmount !== undefined) deal.reviewCommissionAmount = Number(updateData.reviewCommissionAmount) || 0;
    if (updateData.ratingPricingType !== undefined) deal.ratingPricingType = updateData.ratingPricingType;
    if (updateData.ratingLessAmount !== undefined) deal.ratingLessAmount = Number(updateData.ratingLessAmount) || 0;
    if (updateData.ratingCommissionAmount !== undefined) deal.ratingCommissionAmount = Number(updateData.ratingCommissionAmount) || 0;
    if (updateData.orderOnlyPricingType !== undefined) deal.orderOnlyPricingType = updateData.orderOnlyPricingType;
    if (updateData.orderOnlyLessAmount !== undefined) deal.orderOnlyLessAmount = Number(updateData.orderOnlyLessAmount) || 0;
    if (updateData.orderOnlyCommissionAmount !== undefined) deal.orderOnlyCommissionAmount = Number(updateData.orderOnlyCommissionAmount) || 0;
    if (updateData.reviewDeletePricingType !== undefined) deal.reviewDeletePricingType = updateData.reviewDeletePricingType;
    if (updateData.reviewDeleteLessAmount !== undefined) deal.reviewDeleteLessAmount = Number(updateData.reviewDeleteLessAmount) || 0;
    if (updateData.reviewDeleteCommissionAmount !== undefined) deal.reviewDeleteCommissionAmount = Number(updateData.reviewDeleteCommissionAmount) || 0;
    if (updateData.dealType !== undefined) deal.dealType = updateData.dealType;
    if (updateData.description !== undefined) deal.description = updateData.description;
    if (updateData.instructions !== undefined) deal.instructions = updateData.instructions;
    if (updateData.paymentTimeline !== undefined) deal.paymentTimeline = updateData.paymentTimeline;
    if (updateData.whatsappNumber !== undefined) deal.whatsappNumber = updateData.whatsappNumber;
    if (updateData.whatsappMessage !== undefined) deal.whatsappMessage = updateData.whatsappMessage;
    if (updateData.isActive !== undefined) deal.isActive = Boolean(updateData.isActive);

    // Relist Mode: Admin adds fresh custom stock to completed/archived deal
    if (updateData.relist === true) {
      const newReview = updateData.reviewSlots !== undefined ? Number(updateData.reviewSlots) : 10;
      const newRating = updateData.ratingSlots !== undefined ? Number(updateData.ratingSlots) : 10;
      const newOrderOnly = updateData.orderOnlySlots !== undefined ? Number(updateData.orderOnlySlots) : 0;
      deal.reviewSlots = newReview;
      deal.remainingReview = newReview;
      deal.ratingSlots = newRating;
      deal.remainingRating = newRating;
      deal.orderOnlySlots = newOrderOnly;
      deal.remainingOrderOnly = newOrderOnly;
      deal.totalSlots = newReview + newRating + newOrderOnly;
      deal.remainingSlots = newReview + newRating + newOrderOnly;
      deal.isActive = deal.remainingSlots > 0;
    } else {
      // Direct slot overrides
      if (updateData.remainingReview !== undefined) {
        deal.remainingReview = Number(updateData.remainingReview);
      }
      if (updateData.remainingRating !== undefined) {
        deal.remainingRating = Number(updateData.remainingRating);
      }
      if (updateData.remainingOrderOnly !== undefined) {
        deal.remainingOrderOnly = Number(updateData.remainingOrderOnly);
      }

      // Slot adjustment based on total slot modifications
      if (
        updateData.reviewSlots !== undefined ||
        updateData.ratingSlots !== undefined ||
        updateData.orderOnlySlots !== undefined
      ) {
        const newReview = updateData.reviewSlots !== undefined ? Number(updateData.reviewSlots) : deal.reviewSlots;
        const newRating = updateData.ratingSlots !== undefined ? Number(updateData.ratingSlots) : deal.ratingSlots;
        const newOrderOnly =
          updateData.orderOnlySlots !== undefined ? Number(updateData.orderOnlySlots) : deal.orderOnlySlots || 0;

        const usedReview = Math.max(0, deal.reviewSlots - deal.remainingReview);
        const usedRating = Math.max(0, deal.ratingSlots - deal.remainingRating);
        const usedOrderOnly = Math.max(0, (deal.orderOnlySlots || 0) - (deal.remainingOrderOnly || 0));

        deal.reviewSlots = newReview;
        deal.remainingReview = Math.max(0, newReview - usedReview);

        deal.ratingSlots = newRating;
        deal.remainingRating = Math.max(0, newRating - usedRating);

        deal.orderOnlySlots = newOrderOnly;
        deal.remainingOrderOnly = Math.max(0, newOrderOnly - usedOrderOnly);

        deal.totalSlots = newReview + newRating + newOrderOnly;
        deal.remainingSlots = deal.remainingReview + deal.remainingRating + deal.remainingOrderOnly;
      } else if (
        updateData.remainingReview !== undefined ||
        updateData.remainingRating !== undefined ||
        updateData.remainingOrderOnly !== undefined
      ) {
        deal.remainingSlots = deal.remainingReview + deal.remainingRating + (deal.remainingOrderOnly || 0);
      }

      if (deal.remainingSlots <= 0) {
        deal.isActive = false;
      } else if (updateData.isActive !== undefined) {
        deal.isActive = Boolean(updateData.isActive);
      }
    }

    await deal.save();
    return NextResponse.json({ success: true, deal });
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
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Deal.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deal deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
