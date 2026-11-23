import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Brand } from "@/models/Brand";

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ success: true, brands });
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

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const brand = await Brand.create({ name: name.trim(), description: description?.trim() });
    return NextResponse.json({ success: true, brand });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
