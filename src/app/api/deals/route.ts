import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Deal } from "@/models/Deal";
import { Setting } from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const [deals, setting] = await Promise.all([
      Deal.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      Setting.findOne({ key: "global_settings" }).lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        deals,
        setting: setting || {
          orderFormUrl: "https://forms.gle/ydedLFJwcef59hPD7",
          refundFormUrl: "https://forms.gle/ssWFUKVpoxoKzKWc8",
        },
      },
      {
        headers: {
          "Cache-Control": "private, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
