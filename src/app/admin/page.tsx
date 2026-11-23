import React from "react";
import connectToDatabase from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import { Deal } from "@/models/Deal";
import { User, UserRole } from "@/models/User";
import { Package, RotateCcw, Tag, Users, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ThreeEmblem from "@/components/common/ThreeEmblem";
import StatCard from "@/components/common/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const [totalOrders, pendingRefunds, activeDeals, totalUsers, recentOrders] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ status: OrderStatus.REFUND_FORM_FILLED }),
    Deal.countDocuments({ isActive: true }),
    User.countDocuments({}),
    Order.find({}).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const kpis = [
    { label: "Total Form Orders", value: totalOrders, icon: "package", colorScheme: "plum", subtext: "Synced via Google Forms", trend: "Live Synced" },
    { label: "Pending Refunds", value: pendingRefunds, icon: "refund", colorScheme: "lotus", subtext: "Awaiting UTR Payout Desk", trend: "Needs Action" },
    { label: "Active Deals", value: activeDeals, icon: "tag", colorScheme: "gold", subtext: "Live in Deals Studio", trend: "Active Inventory" },
    { label: "Total Members", value: totalUsers, icon: "users", colorScheme: "emerald", subtext: "Buyers & Agents Directory", trend: "Verified" },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner with 3D Interactive Three.js Lotus Gem */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <ThreeEmblem size={72} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              Agency Command Center
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1.5 text-white tracking-tight">
              Operational Overview
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
              Real-time Google Form webhook synchronization, automated slot deductions, and refund authorization desk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Link
            href="/admin/deals"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 text-xs font-black shadow-lg shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-plum-900" />
            + New Deal
          </Link>
          <Link
            href="/admin/orders"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            Review Orders
          </Link>
        </div>
      </div>

      {/* Upgraded Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            trend={kpi.trend}
            // @ts-ignore
            colorScheme={kpi.colorScheme}
          />
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-3xl bg-white border border-plum-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-plum-900 text-base">Recent Form Submissions</h2>
            <p className="text-xs text-gray-400">Synced directly from Google Form webhooks</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-lotus-600 hover:text-lotus-700 flex items-center gap-1"
          >
            View All Orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No orders recorded yet.</p>
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
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-plum-50/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-plum-800">{order.marketplaceOrderId}</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800">{order.customerName}</div>
                      <div className="text-[10px] text-gray-400">{order.customerEmail}</div>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{order.productName}</td>
                    <td className="p-3 font-bold text-plum-900">₹{order.orderAmount}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-[10px]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
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
