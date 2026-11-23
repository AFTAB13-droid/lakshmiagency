"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  X,
  MessageCircle,
  Package,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [utr, setUtr] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
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

  const handleUpdateStatus = async (orderId: string, newStatus: string, customReason?: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          transactionReference: utr,
          rejectionReason: customReason || rejectionReasonInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order marked as ${newStatus.replace(/_/g, " ")}`);
        setSelectedOrder(null);
        setUtr("");
        setRejectionReasonInput("");
        setIsRejecting(false);
        fetchOrders();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const getWhatsAppRejectionUrl = (order: any, reason: string) => {
    const rawPhone = (order.buyerPhone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `*Lakshmi Agency Update: Order #${order.marketplaceOrderId}*\n\nHello ${order.buyerName},\nYour submission for *${order.productName || "Product"}* could not be approved.\n\n❌ *Reason for Rejection:*\n${reason || "Submission verification criteria not met"}\n\nPlease check your Buyer Dashboard or reply to this WhatsApp message to rectify this.\n\n— Lakshmi Agency Support`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.marketplaceOrderId?.toLowerCase().includes(q) ||
      o.buyerName?.toLowerCase().includes(q) ||
      (o.buyerPhone && o.buyerPhone.includes(q)) ||
      (o.mediatorCode && o.mediatorCode.toLowerCase().includes(q)) ||
      (o.productName && o.productName.toLowerCase().includes(q)) ||
      (o.brandName && o.brandName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate paginated slice
  const totalEntries = filteredOrders.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Metric counts
  const pendingCount = orders.filter(
    (o) => o.status === "ORDER_FILLED" || o.status === "REFUND_FORM_FILLED"
  ).length;
  const paidCount = orders.filter((o) => o.status === "APPROVED_AND_PAID").length;
  const totalVolume = orders.reduce((sum, o) => sum + (o.payoutAmount || o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            Master Orders Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Live order repository synced via Google Form webhooks with slot tracking & UTR disburse
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-500">Total:</span>
            <strong className="text-plum-950 font-black">{orders.length}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-gray-500">Pending:</span>
            <strong className="text-amber-700 font-black">{pendingCount}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500">Paid:</span>
            <strong className="text-emerald-700 font-black">{paidCount}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-gold-500" />
            <span className="text-gray-500">Volume:</span>
            <strong className="text-plum-950 font-black">₹{totalVolume.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-plum-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Buyer Phone, Agent Code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-plum-200 text-xs bg-white text-plum-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-plum-400 w-full sm:w-auto shadow-2xs"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="ORDER_FILLED">Step 2: Order Filled (Holding)</option>
            <option value="REFUND_FORM_FILLED">Step 5: Refund Form Filled (Pending Payout)</option>
            <option value="APPROVED_AND_PAID">Step 7: Approved & Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Advanced Animated Table */}
      <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
            <p className="text-xs font-bold">Loading master orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-plum-700" />
            <p className="text-sm font-bold text-gray-600">No orders match filter criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try searching by a different Order ID or status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-plum-50/70 text-plum-900 border-b border-plum-100 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">ORDER ID</th>
                  <th className="p-4 sm:p-5">BUYER DETAILS</th>
                  <th className="p-4 sm:p-5">PRODUCT & BRAND</th>
                  <th className="p-4 sm:p-5">REFUND AMOUNT</th>
                  <th className="p-4 sm:p-5">AGENT</th>
                  <th className="p-4 sm:p-5">STATUS & UTR</th>
                  <th className="p-4 sm:p-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((o) => {
                  const cleanBuyerPhone = o.buyerPhone
                    ? o.buyerPhone.replace(/\D/g, "").slice(-10)
                    : "";

                  const buyerWaUrl = cleanBuyerPhone
                    ? `https://wa.me/91${cleanBuyerPhone}?text=Hello%20${encodeURIComponent(
                        o.buyerName
                      )},%20regarding%20your%20Order%20ID%20${encodeURIComponent(
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

                      {/* Buyer Details with 1-Click WhatsApp */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-extrabold text-gray-900">{o.buyerName}</div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">{o.buyerPhone}</div>
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
                        <div className="font-bold text-gray-900 max-w-[200px] truncate">{o.productName}</div>
                        <div className="text-[11px] text-gold-700 font-semibold mt-0.5">
                          {o.brandName} • <span className="text-gray-500 font-normal">{o.marketplace}</span>
                        </div>
                      </td>

                      {/* Refund Amount */}
                      <td className="p-4 sm:p-5">
                        <div className="font-black text-plum-950 text-sm">₹{o.payoutAmount || o.amount}</div>
                        <div className="text-[10px] text-gray-400">Paid from Google Form</div>
                      </td>

                      {/* Agent */}
                      <td className="p-4 sm:p-5">
                        <span className="font-mono font-black text-xs text-plum-800 px-2 py-0.5 rounded-lg bg-plum-50 border border-plum-200">
                          {o.mediatorCode ? `#${o.mediatorCode}` : "DIRECT"}
                        </span>
                      </td>

                      {/* Status & UTR */}
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
                        {o.transactionReference && (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                            UTR: {o.transactionReference}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setUtr(o.transactionReference || "");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          Manage
                        </button>
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

      {/* Order Manage & Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-gold-300/40 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-plum-100 text-plum-900 border border-plum-200">
                    {selectedOrder.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    #{selectedOrder.marketplaceOrderId}
                  </span>
                </div>
                <h3 className="font-serif font-black text-plum-950 text-base mt-1">
                  Submission Verification Desk
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setIsRejecting(false);
                  setRejectionReasonInput("");
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Dual Section View for Form 1 & Form 2 */}
            <div className="space-y-4 text-xs">
              {/* Product & Financial Overview Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
                <div>
                  <span className="text-gold-300 text-[10px] font-extrabold uppercase tracking-wider block">
                    Product & Platform
                  </span>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {selectedOrder.productName || "Product"}
                  </h4>
                  <p className="text-[11px] text-white/80">
                    Brand: <strong>{selectedOrder.brandName || "General"}</strong> • Platform: <strong>{selectedOrder.marketplace || "Amazon"}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-gold-300 text-[10px] font-extrabold uppercase tracking-wider block">
                    Refund / Payout Due
                  </span>
                  <span className="font-black text-xl text-gold-300">
                    ₹{selectedOrder.payoutAmount || selectedOrder.amount}
                  </span>
                </div>
              </div>

              {/* Existing Rejection Notice if rejected */}
              {selectedOrder.status === "REJECTED" && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-800">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Currently Marked as REJECTED
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Reason: <strong>{selectedOrder.rejectionReason || "No specific reason provided."}</strong>
                  </p>
                  <div className="mt-2.5">
                    <a
                      href={getWhatsAppRejectionUrl(selectedOrder, selectedOrder.rejectionReason || "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Notify Buyer via WhatsApp Direct
                    </a>
                  </div>
                </div>
              )}

              {/* FORM 1: Order Form Submission Details */}
              <div className="p-4 rounded-2xl bg-[#FAF5F8] border border-plum-100/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-plum-100">
                  <h5 className="font-serif font-black text-plum-950 text-xs flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-plum-700" />
                    Form 1: Google Order Form Data
                  </h5>
                  <span className="text-[10px] text-gray-500">
                    Submitted: {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString("en-IN") : "Recorded"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Buyer Name:</span>
                    <strong className="text-plum-950">{selectedOrder.buyerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Phone Number:</span>
                    <strong className="text-plum-950 font-mono">{selectedOrder.buyerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Mediator / Agent:</span>
                    <strong className="text-plum-950">#{selectedOrder.mediatorCode || "DIRECT"}</strong>
                  </div>
                </div>

                {selectedOrder.orderScreenshotUrl && (
                  <div className="pt-2 border-t border-plum-100 flex items-center justify-between">
                    <span className="text-gray-500 font-medium text-[11px]">Order Proof Screenshot:</span>
                    <a
                      href={selectedOrder.orderScreenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-plum-100 hover:bg-plum-200 text-plum-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-plum-700" />
                      View Order Screenshot
                    </a>
                  </div>
                )}
              </div>

              {/* FORM 2: Refund Form Submission Details */}
              <div className="p-4 rounded-2xl bg-[#FAF5F8] border border-plum-100/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-plum-100">
                  <h5 className="font-serif font-black text-plum-950 text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Form 2: Google Refund Form Data
                  </h5>
                  <span className="text-[10px] font-bold text-gray-500">
                    {selectedOrder.refundFormSubmittedAt
                      ? `Submitted: ${new Date(selectedOrder.refundFormSubmittedAt).toLocaleDateString("en-IN")}`
                      : "Pending submission from buyer"}
                  </span>
                </div>

                {selectedOrder.refundFormSubmittedAt ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Submitted UPI ID:</span>
                        <strong className="text-plum-950 font-mono font-bold">
                          {selectedOrder.upiId || "Extracted from Notes"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Expected Payout Date:</span>
                        <strong className="text-emerald-700">
                          {selectedOrder.expectedPayoutDate
                            ? `~${new Date(selectedOrder.expectedPayoutDate).toLocaleDateString("en-IN")}`
                            : "20-25 Working Days"}
                        </strong>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="p-2 rounded-xl bg-white border border-gray-100 text-[11px] text-gray-700 font-mono">
                        {selectedOrder.notes}
                      </div>
                    )}

                    {selectedOrder.reviewScreenshotUrl && (
                      <div className="pt-2 border-t border-plum-100 flex items-center justify-between">
                        <span className="text-gray-500 font-medium text-[11px]">Live Review / Rating Proof:</span>
                        <a
                          href={selectedOrder.reviewScreenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-700" />
                          View Review Screenshot
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">
                    Buyer has not yet submitted the Google Refund Form for this order.
                  </p>
                )}
              </div>

              {/* REJECTION DRAWER / BOX */}
              {isRejecting ? (
                <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-red-900 text-xs flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Specify Rejection Reason (Sends In-App Notification)
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="text-[11px] text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Quick Reason Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Order screenshot invalid / unreadable",
                      "Review not verified / not published on store",
                      "Order cancelled or returned on Amazon/Flipkart",
                      "Incorrect UPI ID or missing payout details",
                      "Outside 20-day refund submission window",
                    ].map((reasonChip) => (
                      <button
                        key={reasonChip}
                        type="button"
                        onClick={() => setRejectionReasonInput(reasonChip)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          rejectionReasonInput === reasonChip
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white text-red-900 border-red-200 hover:bg-red-100/50"
                        }`}
                      >
                        {reasonChip}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Type or customize reason for rejection..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-red-200 bg-white text-xs focus:ring-2 focus:ring-red-400 outline-none text-red-950 font-medium"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-red-200">
                    <a
                      href={getWhatsAppRejectionUrl(selectedOrder, rejectionReasonInput)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      title="Open WhatsApp chat with prefilled rejection message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Send WhatsApp Notice
                    </a>

                    <button
                      type="button"
                      disabled={updating || !rejectionReasonInput.trim()}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, "REJECTED", rejectionReasonInput)
                      }
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Confirm & Send In-App Rejection"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Bank UTR settlement reference if marking approved */
                <div>
                  <label className="block text-xs font-extrabold text-plum-950 mb-1">
                    Bank / UPI Transaction Reference (UTR) <span className="font-normal text-gray-400 text-[10px]">(Optional if settling payout)</span>
                  </label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. UPI Ref 31029481928 / IMPS1298492"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            {!isRejecting && (
              <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  Reject Submission
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder._id, "REFUND_FORM_FILLED")}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-plum-100 hover:bg-plum-200 text-plum-900 font-bold text-xs transition-colors"
                  >
                    Keep as Refund Claimed
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder._id, "APPROVED_AND_PAID")}
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Mark Settled
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
