"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  X,
  Loader2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import StatCard from "@/components/common/StatCard";

export default function PremiumUserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [needsRefundOnly, setNeedsRefundOnly] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 1-Click Claim Order state
  const [claimOrderId, setClaimOrderId] = useState("");
  const [claiming, setClaiming] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mediator/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClaimOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOrderId.trim()) {
      toast.error("Please enter your Marketplace Order ID");
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch("/api/mediator/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: claimOrderId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Order linked to your account!");
        setClaimOrderId("");
        fetchOrders();
      } else {
        toast.error(data.error || "Could not find order");
      }
    } catch (err) {
      toast.error("Network error while claiming order");
    } finally {
      setClaiming(false);
    }
  };

  // KPI counts
  const formsFilledCount = orders.filter((o) => o.status === "REFUND_FORM_FILLED").length;
  const pendingRefundsCount = orders.filter(
    (o) => o.status === "ORDER_FILLED" || o.status === "REFUND_FORM_FILLED"
  ).length;

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.marketplaceOrderId?.toLowerCase().includes(q) ||
      o.brandName?.toLowerCase().includes(q) ||
      (o.productName && o.productName.toLowerCase().includes(q)) ||
      (o.status && o.status.toLowerCase().includes(q));

    const matchesRefundToggle = !needsRefundOnly || o.status === "REFUND_FORM_FILLED";
    return matchesSearch && matchesRefundToggle;
  });

  // Calculate paginated slice
  const totalEntries = filteredOrders.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, needsRefundOnly]);

  // Calculate days left
  const getDaysLeft = (deadlineDate?: string) => {
    if (!deadlineDate) return 20;
    const diff = new Date(deadlineDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top 3 Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Refund Forms Filled"
          value={formsFilledCount}
          icon="check-circle"
          colorScheme="blue"
          subtext="Your Submitted Refund Claims"
          trend="Under Review"
        />
        <StatCard
          label="Pending Refunds"
          value={pendingRefundsCount}
          icon="clock"
          colorScheme="amber"
          subtext="In 20-Day Review Window"
          trend="Countdown"
        />
        <StatCard
          label="Total My Orders"
          value={orders.length}
          icon="shopping-bag"
          colorScheme="plum"
          subtext="Order Forms You Filled"
          trend="Live Synced"
        />
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            My Orders &amp; Refunds
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track all Order Forms and Refund Forms you have submitted, along with payout status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNeedsRefundOnly(!needsRefundOnly)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border shadow-xs ${
              needsRefundOnly
                ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                : "bg-white text-gray-700 border-plum-200 hover:bg-plum-50"
            }`}
          >
            Refund Submitted ({formsFilledCount})
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-2xl bg-white border border-plum-200 text-gray-600 hover:text-plum-950 hover:bg-plum-50 transition-all shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-plum-700" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & 1-Click Claim Missing Order Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7 p-3.5 bg-white rounded-3xl border border-plum-100 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your orders by Order ID, Product, Brand, or Status..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
            />
          </div>
        </div>

        <form
          onSubmit={handleClaimOrder}
          className="lg:col-span-5 p-3.5 bg-white rounded-3xl border border-plum-100 shadow-sm flex items-center gap-2"
        >
          <input
            type="text"
            value={claimOrderId}
            onChange={(e) => setClaimOrderId(e.target.value)}
            placeholder="Missing an order? Enter Order ID to link..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl border border-plum-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20"
          />
          <button
            type="submit"
            disabled={claiming}
            className="px-4 py-2.5 rounded-2xl plum-gradient-bg text-white text-xs font-black shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {claiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5 text-gold-300" />}
            Link Order
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
            <p className="text-xs font-bold">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-plum-700" />
            <p className="text-sm font-bold text-gray-600">No submitted orders found</p>
            <p className="text-xs text-gray-400 mt-1">
              Order Forms you submit with your registered Email or Phone appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-plum-50/70 text-plum-900 border-b border-plum-100 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">ORDER ID</th>
                  <th className="p-4 sm:p-5">PRODUCT &amp; BRAND</th>
                  <th className="p-4 sm:p-5">REFUND AMOUNT</th>
                  <th className="p-4 sm:p-5">STATUS</th>
                  <th className="p-4 sm:p-5">TIMELINE</th>
                  <th className="p-4 sm:p-5">REFUND FORM</th>
                  <th className="p-4 sm:p-5 text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((o) => {
                  const daysLeft = getDaysLeft(o.refundFormDeadline);
                  const isRefundFilled =
                    o.status === "REFUND_FORM_FILLED" || o.status === "APPROVED_AND_PAID";

                  return (
                    <motion.tr
                      key={o._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gradient-to-r hover:from-plum-50/40 hover:via-lotus-50/20 hover:to-white transition-all group"
                    >
                      {/* Order ID */}
                      <td className="p-4 sm:p-5">
                        <div className="font-mono font-black text-plum-950 text-xs">
                          {o.marketplaceOrderId}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}
                        </div>
                      </td>

                      {/* Product & Brand */}
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-gray-900 max-w-[200px] truncate">{o.productName}</div>
                        <div className="text-[11px] text-gold-700 font-semibold mt-0.5">
                          {o.brandName} • <span className="text-gray-500 font-normal">{o.marketplace}</span>
                        </div>
                      </td>

                      {/* Refund Amount */}
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-sm">
                        {o.status === "ORDER_FILLED" ? (
                          <span className="text-gray-400 font-normal">-</span>
                        ) : (
                          `₹${o.payoutAmount || o.amount || 0}`
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 sm:p-5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === "ORDER_FILLED"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : o.status === "REFUND_FORM_FILLED"
                              ? "bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs animate-pulse"
                              : o.status === "APPROVED_AND_PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Refund Timeline */}
                      <td className="p-4 sm:p-5">
                        {o.status === "APPROVED_AND_PAID" ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Paid {o.transactionReference ? `• UTR: ${o.transactionReference}` : ""}
                          </span>
                        ) : isRefundFilled ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Refund Processing (20–25 days)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {daysLeft} day(s) left for Refund Form
                          </span>
                        )}
                      </td>

                      {/* Refund Filled */}
                      <td className="p-4 sm:p-5 font-bold">
                        {isRefundFilled ? (
                          <span className="text-emerald-700 font-black">Submitted</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-800 font-bold text-xs border border-plum-200 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalEntries={totalEntries}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50]}
          />
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gold-300/40">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-serif font-bold text-plum-950 text-base">
                  Order #{selectedOrder.marketplaceOrderId}
                </h3>
                <p className="text-[11px] text-gray-400">
                  Submitted on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs mb-6">
              <div className="p-3.5 rounded-2xl bg-plum-50/50 border border-plum-100 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Product &amp; Brand</span>
                  <span className="font-extrabold text-plum-950 text-xs">
                    {selectedOrder.productName} ({selectedOrder.brandName})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Refund Amount</span>
                  <span className="font-black text-emerald-700 text-base">
                    {selectedOrder.status === "ORDER_FILLED"
                      ? "-"
                      : `₹${selectedOrder.payoutAmount || selectedOrder.amount || 0}`}
                  </span>
                </div>
              </div>

              {selectedOrder.transactionReference && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                  <span className="text-emerald-900 font-bold">Payment UTR / Ref:</span>
                  <span className="font-mono font-black text-emerald-800">{selectedOrder.transactionReference}</span>
                </div>
              )}

              {(selectedOrder.orderScreenshotUrl || selectedOrder.reviewScreenshotUrl) && (
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.orderScreenshotUrl && (
                    <a
                      href={selectedOrder.orderScreenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-plum-50 border border-plum-200 text-plum-900 font-bold flex items-center gap-1.5 hover:bg-plum-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Order Proof
                    </a>
                  )}
                  {selectedOrder.reviewScreenshotUrl && (
                    <a
                      href={selectedOrder.reviewScreenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-lotus-50 border border-lotus-200 text-lotus-900 font-bold flex items-center gap-1.5 hover:bg-lotus-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Review Proof
                    </a>
                  )}
                </div>
              )}

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-gold-50/60 border border-gold-200/80">
                  <span className="text-gold-800 font-bold block mb-0.5">Order Notes:</span>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-plum-900 text-white font-bold text-xs hover:bg-plum-950 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
