import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Setting } from "@/models/Setting";

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne({ key: "global_settings" });
    if (!setting) {
      setting = await Setting.create({ key: "global_settings" });
    }
    return NextResponse.json({ success: true, setting });
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

    const {
      orderFormUrl,
      refundFormUrl,
      orderFormProductEntryId,
      orderFormMediatorEntryId,
      whatsappOrderTemplate,
      whatsappAnnouncementTemplate,
    } = await req.json();

    await connectToDatabase();
    const setting = await Setting.findOneAndUpdate(
      { key: "global_settings" },
      {
        orderFormUrl,
        refundFormUrl,
        orderFormProductEntryId: orderFormProductEntryId?.trim() || "",
        orderFormMediatorEntryId: orderFormMediatorEntryId?.trim() || "",
        whatsappOrderTemplate,
        whatsappAnnouncementTemplate,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, setting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
