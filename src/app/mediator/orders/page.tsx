"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  MessageCircle,
  Eye,
  X,
  Loader2,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import StatCard from "@/components/common/StatCard";

export default function MediatorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [needsRefundOnly, setNeedsRefundOnly] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mediator/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch("/api/mediator/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order marked as ${newStatus.replace(/_/g, " ")}`);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setStatusUpdating(false);
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
      o.buyerName?.toLowerCase().includes(q) ||
      (o.buyerEmail && o.buyerEmail.toLowerCase().includes(q)) ||
      (o.buyerPhone && o.buyerPhone.includes(q)) ||
      (o.productName && o.productName.toLowerCase().includes(q));

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
      {/* Top 3 Upgraded Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Forms Filled"
          value={formsFilledCount}
          icon="check-circle"
          colorScheme="blue"
          subtext="Buyer Google Refund Claims"
          trend="Action Ready"
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
          label="Total Orders"
          value={orders.length}
          icon="shopping-bag"
          colorScheme="plum"
          subtext="Referencing Your Code"
          trend="Live Synced"
        />
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track submitted orders under your link, holding windows, and WhatsApp customer reminders
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
            Needs Refund Only ({formsFilledCount})
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

      {/* Search Bar */}
      <div className="p-3.5 bg-white rounded-3xl border border-plum-100 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Buyer Name, Email, Phone, Product..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
            <p className="text-xs font-bold">Loading orders desk...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-plum-700" />
            <p className="text-sm font-bold text-gray-600">No matching orders found</p>
            <p className="text-xs text-gray-400 mt-1">Orders referencing your Agent Code will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-plum-50/70 text-plum-900 border-b border-plum-100 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">ORDER ID</th>
                  <th className="p-4 sm:p-5">CUSTOMER</th>
                  <th className="p-4 sm:p-5">PRODUCT & BRAND</th>
                  <th className="p-4 sm:p-5">AMOUNT</th>
                  <th className="p-4 sm:p-5">STATUS</th>
                  <th className="p-4 sm:p-5">REFUND TIMELINE</th>
                  <th className="p-4 sm:p-5">REFUND FILLED</th>
                  <th className="p-4 sm:p-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((o) => {
                  const daysLeft = getDaysLeft(o.refundFormDeadline);
                  const isRefundFilled =
                    o.status === "REFUND_FORM_FILLED" || o.status === "APPROVED_AND_PAID";

                  const cleanBuyerPhone = o.buyerPhone
                    ? o.buyerPhone.replace(/\D/g, "").slice(-10)
                    : "";

                  const buyerWaUrl = cleanBuyerPhone
                    ? `https://wa.me/91${cleanBuyerPhone}?text=Hello%20${encodeURIComponent(
                        o.buyerName
                      )},%20this%20is%20your%20mediator%20regarding%20Order%20ID%20${encodeURIComponent(
                        o.marketplaceOrderId
                      )}...`
                    : null;

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

                      {/* Customer Info with WhatsApp Pill */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-extrabold text-gray-900">{o.buyerName}</div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {o.buyerEmail || o.buyerPhone}
                            </div>
                          </div>
                          {buyerWaUrl && (
                            <a
                              href={buyerWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200 transition-all shadow-2xs hover:scale-110 active:scale-95"
                              title="Message Buyer on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Product & Brand */}
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-gray-900 max-w-[170px] truncate">{o.productName}</div>
                        <div className="text-[11px] text-gold-700 font-semibold mt-0.5">
                          {o.brandName} • <span className="text-gray-500 font-normal">{o.marketplace}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-sm">₹{o.amount}</td>

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
                        {isRefundFilled ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Refund Processing (20–25 days)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            On Track - {daysLeft} day(s) left before form closes
                          </span>
                        )}
                      </td>

                      {/* Refund Filled */}
                      <td className="p-4 sm:p-5 font-bold">
                        {isRefundFilled ? (
                          <span className="text-emerald-700 font-black">Yes</span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-800 font-bold text-xs border border-plum-200 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AspireMint-style Pagination */}
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
                  Customer: {selectedOrder.buyerName} ({selectedOrder.buyerPhone})
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
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Product & Brand</span>
                  <span className="font-extrabold text-plum-950 text-xs">
                    {selectedOrder.productName} ({selectedOrder.brandName})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Order Amount</span>
                  <span className="font-black text-plum-950 text-base">₹{selectedOrder.amount}</span>
                </div>
              </div>

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
