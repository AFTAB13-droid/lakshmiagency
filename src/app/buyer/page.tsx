"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Tag,
  Clock,
  CheckCircle2,
  ExternalLink,
  FileText,
  RotateCcw,
  Receipt,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
  Filter,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import ThreeEmblem from "@/components/common/ThreeEmblem";
import StatCard from "@/components/common/StatCard";

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "READY" | "FILLED">("ALL");
  const [search, setSearch] = useState("");

  // Modal States
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null);
  const [viewRefundDetailsOrder, setViewRefundDetailsOrder] = useState<any>(null);

  // Manual Check Order ID State
  const [manualOrderId, setManualOrderId] = useState("");
  const [manualCheckResult, setManualCheckResult] = useState<"NONE" | "FOUND" | "NOT_FOUND">("NONE");

  useEffect(() => {
    fetch("/api/buyer/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch((err) => console.error("Failed to load buyer orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const getDaysLeft = (deadlineDate?: string) => {
    if (!deadlineDate) return 20;
    const diff = new Date(deadlineDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Helper to generate Google Refund Form prefilled link
  const buildPreFilledRefundUrl = (order: any) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_REFUND_FORM_URL || "https://forms.gle/ssWFUKVpoxoKzKWc8";

    // Google Form entry parameters (can be configured in Settings or .env)
    const params = new URLSearchParams({
      usp: "pp_url",
      // Common prefill entry names or query params
      "entry.orderId": order.marketplaceOrderId || "",
      "entry.buyerName": order.buyerName || "",
      "entry.buyerPhone": order.buyerPhone || "",
      "entry.productName": order.productName || "",
      "entry.mediatorCode": order.mediatorCode || "",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Tab Filtering (Workflow strictly focuses on: Order -> Review Holding -> Refund Form Filled)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        o.marketplaceOrderId?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o.brandName?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "READY") {
        return o.status === "ORDER_FILLED" || o.status === "HOLDING_PERIOD";
      }
      if (activeTab === "FILLED") {
        return o.status === "REFUND_FORM_FILLED" || o.status === "APPROVED_AND_PAID";
      }
      return true;
    });
  }, [orders, activeTab, search]);

  // Counts for tabs
  const readyCount = orders.filter((o) => o.status === "ORDER_FILLED" || o.status === "HOLDING_PERIOD").length;
  const filledCount = orders.filter((o) => o.status === "REFUND_FORM_FILLED" || o.status === "APPROVED_AND_PAID").length;

  // Handle manual order check & auto-claim
  const handleCheckManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderId.trim()) return;
    const match = orders.find(
      (o) => o.marketplaceOrderId?.toLowerCase() === manualOrderId.trim().toLowerCase()
    );
    if (match) {
      setManualCheckResult("FOUND");
      setSelectedOrderForRefund(match);
      toast.success("Order located in your dashboard!");
    } else {
      // Check database to claim order if registered after filling form
      try {
        const res = await fetch("/api/buyer/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: manualOrderId.trim() }),
        });
        const data = await res.json();
        if (data.success && data.order) {
          toast.success("Order claimed and linked to your account!");
          setOrders((prev) => [data.order, ...prev.filter((o) => o._id !== data.order._id)]);
          setManualCheckResult("FOUND");
          setSelectedOrderForRefund(data.order);
        } else {
          setManualCheckResult("NOT_FOUND");
          toast.error(data.error || "Order not found in database.");
        }
      } catch (err) {
        setManualCheckResult("NOT_FOUND");
        toast.error("Failed to query order.");
      }
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner with 3D Interactive Three.js Lotus Gem */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <ThreeEmblem size={72} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              Buyer Portal
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1.5 text-white tracking-tight">
              My Orders & Refund Tracking
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-lg font-medium">
              Track holding periods, review countdowns, and claim verified payouts with auto-prefilled Google Forms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Link
            href="/buyer/deals"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 text-xs font-black shadow-lg shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-plum-900" />
            Explore Deals
          </Link>

          <a
            href={process.env.NEXT_PUBLIC_ORDER_FORM_URL || "https://forms.gle/ydedLFJwcef59hPD7"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-gold-300" />
            Order Form
          </a>

          <a
            href={process.env.NEXT_PUBLIC_REFUND_FORM_URL || "https://forms.gle/ssWFUKVpoxoKzKWc8"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-gold-400" />
            Refund Form
          </a>
        </div>
      </div>

      {/* Upgraded Dynamic Stat Cards Grid (Focused strictly on Orders -> Holding -> Refund Form Filled) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Orders Placed"
          value={orders.length}
          icon="shopping-bag"
          colorScheme="plum"
          subtext="Submitted via Order Form"
          trend="Live Synced"
          onClick={() => setActiveTab("ALL")}
        />
        <StatCard
          label="In Review / Holding"
          value={readyCount}
          icon="clock"
          colorScheme="amber"
          subtext="4-5 Days Review Window"
          trend="Holding Period"
          onClick={() => setActiveTab("READY")}
        />
        <StatCard
          label="Refund Claims Submitted"
          value={filledCount}
          icon="refund"
          colorScheme="emerald"
          subtext="Google Refund Form Logged"
          trend="Claim Active"
          onClick={() => setActiveTab("FILLED")}
        />
      </div>

      {/* 9-Step Agency Policy Notice Banner */}
      <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-200/90 flex items-start gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
        <div className="text-gray-700 leading-relaxed">
          <strong className="text-plum-900">Important Agency Guidelines:</strong> Submit product reviews within 4–5 days of delivery. The Google Refund Form must be completed within <strong>20 days of delivery</strong>. Verified refunds are disbursed within <strong>20 to 25 working days</strong> (excluding weekends and government holidays). COD & platform fees are non-refundable.
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-plum-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-plum-50/60 rounded-2xl border border-plum-100 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-white text-plum-900 shadow-sm border border-plum-200"
                : "text-gray-600 hover:text-plum-900"
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("READY")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "READY"
                ? "bg-white text-plum-900 shadow-sm border border-plum-200"
                : "text-gray-600 hover:text-plum-900"
            }`}
          >
            Ready for Refund ({readyCount})
          </button>

          <button
            onClick={() => setActiveTab("FILLED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "FILLED"
                ? "bg-white text-plum-900 shadow-sm border border-plum-200"
                : "text-gray-600 hover:text-plum-900"
            }`}
          >
            Refund Forms Submitted ({filledCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Product..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
            <p className="text-xs font-bold">Loading your order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100 shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30 text-plum-700" />
            <p className="text-sm font-bold text-gray-600">No orders found in this view</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === "FILLED"
                ? "You haven't submitted a refund form yet. Once your review goes live, click 'Fill Refund Form' on any eligible order!"
                : "Submit your marketplace order through the Google Order Form to begin tracking!"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const daysLeft = getDaysLeft(order.refundFormDeadline);
            const isRefundSubmitted =
              order.status === "REFUND_FORM_FILLED" || order.status === "APPROVED_AND_PAID";

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Marketplace Order ID</div>
                    <div className="font-mono font-black text-plum-950 text-base">{order.marketplaceOrderId}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Product & Brand</div>
                    <div className="font-extrabold text-gray-900 text-xs">{order.productName}</div>
                    <div className="text-[10px] text-lotus-600 font-semibold">{order.brandName} • {order.marketplace}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Refund Payout Due</div>
                    <div className="font-black text-plum-950 text-base">₹{order.payoutAmount || order.amount}</div>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isRefundSubmitted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs"
                          : order.status === "REJECTED"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isRefundSubmitted
                        ? "REFUND FORM SUBMITTED"
                        : order.status === "REJECTED"
                        ? "REJECTED"
                        : "AWAITING REVIEW"}
                    </span>
                  </div>
                </div>

                {/* 3-Step Agency Workflow Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-4">
                  {[
                    { label: "1. Order Form Filled", active: true },
                    {
                      label: "2. Holding Period (4–5 Days)",
                      active: ["HOLDING_PERIOD", "REFUND_FORM_FILLED", "APPROVED_AND_PAID"].includes(order.status),
                    },
                    {
                      label: "3. Refund Form Submitted",
                      active: isRefundSubmitted,
                    },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                        step.active
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs"
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    >
                      {step.active && (
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                      )}
                      {step.label}
                    </div>
                  ))}
                </div>

                {/* Status Bar & Action Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-plum-50/50 p-3.5 rounded-2xl mt-4 border border-plum-100/60">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Clock className="w-4 h-4 text-plum-700 shrink-0" />
                    {isRefundSubmitted ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ Refund Form Submitted! Agency will process reimbursement directly to your UPI/Bank within 20–25 working days.
                      </span>
                    ) : (
                      <span className="text-plum-900 font-semibold">
                        {daysLeft > 0 ? (
                          <>
                            <strong className="text-lotus-600 font-black">{daysLeft} days remaining</strong> to complete Google Refund Form once your review is live.
                          </>
                        ) : (
                          <strong className="text-red-600 font-bold">20-day refund claim window has elapsed</strong>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Actions depending on status */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isRefundSubmitted ? (
                      <button
                        onClick={() => setViewRefundDetailsOrder(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        View Refund Submission
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedOrderForRefund(order)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-lotus-600 to-plum-700 hover:from-lotus-700 hover:to-plum-800 text-white text-xs font-bold shadow-md shadow-plum-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-gold-300" />
                        Fill Refund Form
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. GATED PRE-FILL REFUND MODAL WITH AUTOMATED VERIFICATION */}
      {/* ========================================================================= */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gold-300/40"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-plum-950 text-base">Claim Order Refund</h3>
                  <p className="text-[11px] text-gold-600 font-bold">Pre-fill Verification Desk</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForRefund(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Status Banner */}
            {selectedOrderForRefund.status === "ORDER_FILLED" ||
            selectedOrderForRefund.status === "HOLDING_PERIOD" ? (
              <div className="space-y-4 text-xs">
                {/* Green Verified Box */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Order Form Verified & Synced!
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    We found your Order Form submission for this product. Your Order ID and contact details will be <strong>automatically pre-filled</strong> in the Google Refund Form to avoid typos.
                  </p>
                </div>

                {/* Pre-filled Details Summary */}
                <div className="p-4 rounded-2xl bg-plum-50/50 border border-plum-100 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-plum-800">
                    Pre-filled Google Form Fields:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Order ID:</span>
                      <span className="font-mono font-bold text-plum-950">
                        {selectedOrderForRefund.marketplaceOrderId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Product:</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {selectedOrderForRefund.productName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Buyer Name:</span>
                      <span className="font-semibold text-gray-700">
                        {selectedOrderForRefund.buyerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Agent / Mediator:</span>
                      <span className="font-mono font-bold text-gold-700">
                        #{selectedOrderForRefund.mediatorCode || "DIRECT"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className="text-[11px] text-gray-500 italic">
                  💡 Make sure your review is live on {selectedOrderForRefund.marketplace || "Amazon"} before submitting the refund form with proof screenshot.
                </div>

                {/* Action Button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedOrderForRefund(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <a
                    href={buildPreFilledRefundUrl(selectedOrderForRefund)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      toast.success("Opening pre-filled Google Refund Form...");
                      setSelectedOrderForRefund(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-plum-950 font-black text-xs shadow-md shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    Go Ahead to Google Refund Form
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              /* Warning Box if Order Form was never filled or invalid */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-black text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    No Order Form Detected For This Order!
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Under Lakshmi Agency Rules #2 & #8, you <strong>must submit the Order Form first</strong> after placing your marketplace order. Refund forms submitted without an order form cannot be approved.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2">
                  <a
                    href="https://wa.me/918608093086?text=Hello%20Lakshmi%20Agency,%20I%20need%20help%20with%20Order%20Form%20verification."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    Contact Admin on WhatsApp
                  </a>

                  <a
                    href={process.env.NEXT_PUBLIC_ORDER_FORM_URL || "https://forms.gle/ydedLFJwcef59hPD7"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl plum-gradient-bg text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 hover:opacity-95"
                  >
                    Fill Order Form First
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW SUBMITTED ORDER & REFUND DETAILS MODAL (DUAL FORM VERIFICATION) */}
      {/* ========================================================================= */}
      {viewRefundDetailsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-plum-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-plum-100 text-plum-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-plum-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-plum-950 text-base">
                    Order & Refund Submission Details
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Order #{viewRefundDetailsOrder.marketplaceOrderId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewRefundDetailsOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* STATUS BANNER */}
              {viewRefundDetailsOrder.status === "REJECTED" ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    SUBMISSION REJECTED BY ADMINISTRATION
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Reason: <strong>{viewRefundDetailsOrder.rejectionReason || "Verification criteria not met."}</strong>
                  </p>
                  <p className="text-[11px] text-red-600/80">
                    If you believe this was an error, please reach out to your mediator (Agent #{viewRefundDetailsOrder.mediatorCode || "DIRECT"}) or WhatsApp support.
                  </p>
                </div>
              ) : viewRefundDetailsOrder.status === "REFUND_FORM_FILLED" ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    REFUND CLAIM SUBMITTED
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Both your Google Order Form and Google Refund Form have been received and verified. Payout is processed within <strong>20-25 working days</strong> directly to your submitted UPI/bank account.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-800">
                    <Clock className="w-4 h-4 text-blue-600" />
                    ORDER FORM RECEIVED • HOLDING & REVIEW STAGE
                  </div>
                  <p className="text-[11px] text-blue-900">
                    Order confirmed. Please wait for product delivery, test for 4-5 days, leave a review/rating, and submit the Refund Form within 20 days.
                  </p>
                </div>
              )}

              {/* FORM 1: GOOGLE ORDER FORM DETAILS */}
              <div className="p-4 rounded-2xl bg-[#FAF5F8] border border-plum-100 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-plum-100">
                  <h4 className="font-serif font-black text-plum-950 text-xs flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-plum-700" />
                    Form 1: Google Order Form (Purchase Details)
                  </h4>
                  <span className="text-[10px] text-gray-500">
                    {viewRefundDetailsOrder.orderDate
                      ? new Date(viewRefundDetailsOrder.orderDate).toLocaleDateString("en-IN")
                      : "Synced"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Product Name:</span>
                    <strong className="text-plum-950">{viewRefundDetailsOrder.productName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Brand & Marketplace:</span>
                    <strong className="text-plum-950">
                      {viewRefundDetailsOrder.brandName || "Brand"} • {viewRefundDetailsOrder.marketplace || "Amazon"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Amount Paid:</span>
                    <strong className="text-plum-950">₹{viewRefundDetailsOrder.amount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Assigned Agent:</span>
                    <strong className="text-plum-950">#{viewRefundDetailsOrder.mediatorCode || "DIRECT"}</strong>
                  </div>
                </div>

                {viewRefundDetailsOrder.orderScreenshotUrl && (
                  <div className="pt-2 border-t border-plum-100 flex items-center justify-between">
                    <span className="text-gray-500 font-medium text-[11px]">Order Proof Screenshot:</span>
                    <a
                      href={viewRefundDetailsOrder.orderScreenshotUrl}
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

              {/* FORM 2: GOOGLE REFUND FORM DETAILS */}
              <div className="p-4 rounded-2xl bg-[#FAF5F8] border border-plum-100 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-plum-100">
                  <h4 className="font-serif font-black text-plum-950 text-xs flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-lotus-600" />
                    Form 2: Google Refund Form (Review & Payout)
                  </h4>
                  <span className="text-[10px] font-bold text-gray-500">
                    {viewRefundDetailsOrder.refundFormSubmittedAt
                      ? new Date(viewRefundDetailsOrder.refundFormSubmittedAt).toLocaleDateString("en-IN")
                      : "Not submitted yet"}
                  </span>
                </div>

                {viewRefundDetailsOrder.refundFormSubmittedAt ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Refund Amount:</span>
                        <strong className="text-emerald-700 font-black text-sm">
                          ₹{viewRefundDetailsOrder.payoutAmount || viewRefundDetailsOrder.amount}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Payout Target Date:</span>
                        <strong className="text-gray-800">
                          {viewRefundDetailsOrder.expectedPayoutDate
                            ? `~${new Date(viewRefundDetailsOrder.expectedPayoutDate).toLocaleDateString("en-IN")}`
                            : "20-25 Working Days"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Submitted UPI ID:</span>
                        <strong className="text-plum-950 font-mono">
                          {viewRefundDetailsOrder.upiId || "Registered in form"}
                        </strong>
                      </div>
                      {viewRefundDetailsOrder.transactionReference && (
                        <div>
                          <span className="text-gray-400 block text-[10px]">Settlement UTR:</span>
                          <strong className="text-emerald-800 font-mono">
                            {viewRefundDetailsOrder.transactionReference}
                          </strong>
                        </div>
                      )}
                    </div>

                    {viewRefundDetailsOrder.reviewScreenshotUrl && (
                      <div className="pt-2 border-t border-plum-100 flex items-center justify-between">
                        <span className="text-gray-500 font-medium text-[11px]">Review / Rating Proof Screenshot:</span>
                        <a
                          href={viewRefundDetailsOrder.reviewScreenshotUrl}
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
                  <div className="p-3 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-500">
                        Refund Form pending. Once you complete the review, click to claim your refund:
                      </p>
                    </div>
                    <a
                      href={buildPreFilledRefundUrl(viewRefundDetailsOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-lotus-600 to-pink-600 text-white font-bold text-[11px] hover:shadow-md transition-all shrink-0 ml-2"
                    >
                      Fill Refund Form →
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setViewRefundDetailsOrder(null)}
                className="px-6 py-2 rounded-xl bg-plum-900 text-white font-bold text-xs hover:bg-plum-950 transition-colors"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
