import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Marketplace } from "@/models/Marketplace";

export async function GET() {
  try {
    await connectToDatabase();
    const marketplaces = await Marketplace.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ success: true, marketplaces });
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

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Platform name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const marketplace = await Marketplace.create({ name: name.trim(), slug });
    return NextResponse.json({ success: true, marketplace });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
