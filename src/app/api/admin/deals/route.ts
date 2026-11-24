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
      reviewSlots,
      ratingSlots,
      dealType,
    } = body;

    if (!brandName || !productName || !productCode || !price) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Deal.findOne({ productCode: productCode.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Product Code already exists" }, { status: 400 });
    }

    const rSlots = Number(reviewSlots) || 0;
    const ratSlots = Number(ratingSlots) || 0;
    const totalSlots = rSlots + ratSlots;

    const newDeal = await Deal.create({
      brandName,
      productName,
      productCode: productCode.toUpperCase(),
      marketplace: marketplace || "Amazon",
      productLink: productLink || "",
      productImage: productImage || "",
      price: Number(price),
      pricingType: pricingType || "FULL_REFUND",
      lessAmount: Number(lessAmount) || 0,
      commissionAmount: Number(commissionAmount) || 0,
      totalSlots,
      remainingSlots: totalSlots,
      reviewSlots: rSlots,
      remainingReview: rSlots,
      ratingSlots: ratSlots,
      remainingRating: ratSlots,
      dealType: dealType || "Original",
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
    if (updateData.dealType !== undefined) deal.dealType = updateData.dealType;
    if (updateData.isActive !== undefined) deal.isActive = Boolean(updateData.isActive);

    // Update slots if provided
    if (updateData.reviewSlots !== undefined || updateData.ratingSlots !== undefined) {
      const newReview = updateData.reviewSlots !== undefined ? Number(updateData.reviewSlots) : deal.reviewSlots;
      const newRating = updateData.ratingSlots !== undefined ? Number(updateData.ratingSlots) : deal.ratingSlots;

      const usedReview = Math.max(0, deal.reviewSlots - deal.remainingReview);
      const usedRating = Math.max(0, deal.ratingSlots - deal.remainingRating);

      deal.reviewSlots = newReview;
      deal.remainingReview = Math.max(0, newReview - usedReview);

      deal.ratingSlots = newRating;
      deal.remainingRating = Math.max(0, newRating - usedRating);

      deal.totalSlots = newReview + newRating;
      deal.remainingSlots = deal.remainingReview + deal.remainingRating;
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
