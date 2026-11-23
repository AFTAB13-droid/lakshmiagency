import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Notification } from "@/models/Notification";

// 1. GET: Fetch notifications & unread count
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // @ts-ignore
    const userId = session.user.id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PATCH: Toggle read / unread status for a single notification
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, isRead } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    await connectToDatabase();
    // @ts-ignore
    const userId = session.user.id;

    await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: Boolean(isRead) } }
    );

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. DELETE: Delete individual notification OR delete all notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, deleteAll } = await req.json();
    await connectToDatabase();
    // @ts-ignore
    const userId = session.user.id;

    if (deleteAll) {
      await Notification.deleteMany({ recipient: userId });
      return NextResponse.json({ success: true, message: "All notifications cleared", unreadCount: 0 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    await Notification.deleteOne({ _id: notificationId, recipient: userId });

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return NextResponse.json({ success: true, message: "Notification deleted", unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
