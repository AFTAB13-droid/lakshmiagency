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
