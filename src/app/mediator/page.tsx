import React from "react";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Deal } from "@/models/Deal";
import { User } from "@/models/User";
import { getSelfUserOrders } from "@/lib/webhookHelpers";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Link from "next/link";
import { ShoppingBag, Clock, RotateCcw, CheckCircle2, Tag, ArrowRight } from "lucide-react";
import ThreeEmblem from "@/components/common/ThreeEmblem";
import StatCard from "@/components/common/StatCard";

export const dynamic = "force-dynamic";

export default async function PremiumUserDashboardPage() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userId = session?.user?.id;
  const email = session?.user?.email?.toLowerCase().trim();
  const currentUser = email ? await User.findOne({ email }).select("mobile _id").lean() : null;

  const [allSelfOrders, availableDeals] = await Promise.all([
    getSelfUserOrders({
      _id: currentUser?._id || userId,
      email,
      mobile: currentUser?.mobile,
    }),
    Deal.countDocuments({ isActive: true, remainingSlots: { $gt: 0 } }),
  ]);

  const myOrdersCount = allSelfOrders.length;
  const pendingRefunds = allSelfOrders.filter((o: any) => o.status === OrderStatus.ORDER_FILLED).length;
  const formsFilled = allSelfOrders.filter((o: any) => o.status === OrderStatus.REFUND_FORM_FILLED).length;
  const approvedPaid = allSelfOrders.filter((o: any) => o.status === OrderStatus.APPROVED_AND_PAID).length;
  const recentOrders = allSelfOrders.slice(0, 5);

  const cards = [
    { label: "My Orders", val: myOrdersCount, icon: "shopping-bag", colorScheme: "plum", subtext: "Forms You Submitted", trend: "Live Synced" },
    { label: "Order Filled", val: pendingRefunds, icon: "clock", colorScheme: "amber", subtext: "Awaiting Refund Form", trend: "Countdown" },
    { label: "Refund Forms Filled", val: formsFilled, icon: "refund", colorScheme: "blue", subtext: "Claim Under Review", trend: "Processing" },
    { label: "Approved / Paid", val: approvedPaid, icon: "check-circle", colorScheme: "emerald", subtext: "UTR Settled & Closed", trend: "Completed" },
    { label: "Available Deals", val: availableDeals, icon: "tag", colorScheme: "gold", subtext: "Open Deal Campaigns", trend: "Live Deals" },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner with 3D Interactive Three.js Lotus Gem */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <ThreeEmblem size={72} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              Premium User Portal
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1.5 text-white tracking-tight">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
              Explore active deals, track all Order Forms and Refund Forms you have filled, and monitor your payouts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Link
            href="/mediator/deals"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 text-xs font-black shadow-lg shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-plum-900" />
            Browse Deals
          </Link>
          <Link
            href="/mediator/orders"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            View Orders Desk
          </Link>
        </div>
      </div>

      {/* Upgraded Dynamic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.val}
            icon={c.icon}
            subtext={c.subtext}
            trend={c.trend}
            // @ts-ignore
            colorScheme={c.colorScheme}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-plum-900 text-base">Your Recent Orders</h2>
            <p className="text-xs text-gray-400">Order Forms &amp; Refund Forms submitted under your account</p>
          </div>
          <Link href="/mediator/orders" className="text-xs font-bold text-lotus-600 flex items-center gap-1 hover:underline">
            Go to Orders Desk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No orders assigned yet. Share your deal links with buyers to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-plum-50/60 text-plum-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o: any) => (
                  <tr key={o._id.toString()} className="hover:bg-plum-50/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-plum-800">{o.marketplaceOrderId}</td>
                    <td className="p-3 font-semibold text-gray-800">{o.customerName}</td>
                    <td className="p-3 text-gray-700">{o.productName}</td>
                    <td className="p-3 font-bold text-plum-900">₹{o.orderAmount}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
