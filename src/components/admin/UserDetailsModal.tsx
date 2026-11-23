"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Award,
  Shield,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageCircle,
  Loader2,
  Package,
} from "lucide-react";

interface UserDetailsModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailsModal({ userId, onClose }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchOrder, setSearchOrder] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/admin/users/${userId}/orders`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Error loading user details:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const user = data?.user;
  const stats = data?.stats;
  const orders: any[] = data?.orders || [];

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    const q = searchOrder.toLowerCase();
    return (
      o.marketplaceOrderId?.toLowerCase().includes(q) ||
      o.productName?.toLowerCase().includes(q) ||
      o.brandName?.toLowerCase().includes(q) ||
      o.buyerName?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  // Clean phone number for WhatsApp
  const cleanPhone = user?.mobile
    ? user.mobile.replace(/\D/g, "").slice(-10)
    : "";

  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
        user?.name || "Member"
      )},%20this%20is%20Lakshmi%20Agency%20Admin.%20Regarding%20your%20account...`
    : "#";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-plum-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gold-300/40 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-900 text-white flex items-center justify-between border-b border-gold-400/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-gold-300 border border-gold-400/30 flex items-center justify-center font-serif font-black text-xl shadow-inner">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                    {user?.name || "Loading Member Details..."}
                  </h2>
                  {user?.role && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.role === "PREMIUM_USER"
                          ? "bg-gold-400 text-plum-950"
                          : user.role === "ADMIN"
                          ? "bg-plum-200 text-plum-900"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {user.role === "PREMIUM_USER" ? (
                        <>
                          <Award className="w-3 h-3" />
                          Mediator ({user.mediatorCode || "LAX"})
                        </>
                      ) : user.role === "ADMIN" ? (
                        <>
                          <Shield className="w-3 h-3" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          Buyer
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gold-200/90 flex items-center gap-3 mt-1 font-medium">
                  <span>Registered: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</span>
                  <span>•</span>
                  <span>Status: {user?.isActive ? "Active Account" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              title="Close Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
            {loading ? (
              <div className="py-20 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
                <p className="text-xs font-semibold">Loading member profile and orders...</p>
              </div>
            ) : !user ? (
              <div className="py-12 text-center text-red-500 text-xs">
                Failed to load user information.
              </div>
            ) : (
              <>
                {/* Contact & Payment Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* WhatsApp Direct Messaging Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 via-white to-emerald-50/40 border border-emerald-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                        WhatsApp Contact
                      </span>
                      <div className="font-extrabold text-gray-900 text-sm mt-1 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        {user.mobile || "No phone added"}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </div>
                    </div>

                    {cleanPhone && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                        Message on WhatsApp
                        <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                      </a>
                    )}
                  </div>

                  {/* Payment Details Card */}
                  <div className="p-4 rounded-2xl bg-white border border-plum-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-700 block">
                        Payout Account (UPI / Bank)
                      </span>
                      <div className="mt-1.5 space-y-1">
                        <div className="text-xs font-mono font-bold text-plum-950 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-gold-600" />
                          UPI ID: {user.paymentDetails?.upiId || "Not configured"}
                        </div>
                        {user.paymentDetails?.accountNumber && (
                          <div className="text-[11px] text-gray-600">
                            A/C: {user.paymentDetails.accountNumber} • IFSC: {user.paymentDetails.ifscCode}
                          </div>
                        )}
                        {user.paymentDetails?.bankName && (
                          <div className="text-[10px] text-gray-400">
                            Bank: {user.paymentDetails.bankName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 mt-2">
                      Verified payout route for approved refunds
                    </div>
                  </div>

                  {/* Order Stats Overview Card */}
                  <div className="p-4 rounded-2xl bg-plum-50/50 border border-plum-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-plum-800 block">
                        Lifecycle Overview
                      </span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 rounded-xl bg-white border border-plum-100/60">
                          <div className="text-[10px] text-gray-400 font-bold">TOTAL ORDERS</div>
                          <div className="text-lg font-black text-plum-950">{stats?.totalOrders || 0}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-plum-100/60">
                          <div className="text-[10px] text-gray-400 font-bold">PAID REFUNDS</div>
                          <div className="text-lg font-black text-emerald-600">{stats?.approvedPaid || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-plum-700 mt-2">
                      Total Volume: ₹{stats?.totalAmount?.toLocaleString("en-IN") || 0}
                    </div>
                  </div>
                </div>

                {/* Orders Timeline Section */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-black text-plum-950 text-base flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gold-600" />
                        {user.role === "PREMIUM_USER"
                          ? `All Orders Managed Under Agent #${user.mediatorCode || "LAX"}`
                          : "Submitted Orders History"}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {user.role === "PREMIUM_USER"
                          ? "Every marketplace order placed by buyers referencing this mediator's link."
                          : "Orders submitted through the official Google Forms with live status tracking."}
                      </p>
                    </div>

                    {orders.length > 0 && (
                      <input
                        type="text"
                        value={searchOrder}
                        onChange={(e) => setSearchOrder(e.target.value)}
                        placeholder="Filter user orders..."
                        className="px-3 py-1.5 rounded-xl border border-plum-200 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-plum-400"
                      />
                    )}
                  </div>

                  {/* Orders Table */}
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-plum-50/30 border border-dashed border-plum-200 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-plum-700" />
                      <p className="text-xs font-bold text-gray-600">No orders recorded for this member</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        When orders are submitted via Google Form webhooks, they will appear here in chronological order.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-plum-100 shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-plum-50/60 text-plum-900 font-bold uppercase tracking-wider text-[11px] border-b border-plum-100">
                            <th className="p-3.5">ORDER ID</th>
                            <th className="p-3.5">PRODUCT & BRAND</th>
                            {user.role === "PREMIUM_USER" && <th className="p-3.5">CUSTOMER</th>}
                            <th className="p-3.5">AMOUNT</th>
                            <th className="p-3.5">STATUS</th>
                            <th className="p-3.5">DATE</th>
                            <th className="p-3.5 text-right">WHATSAPP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {filteredOrders.map((order) => {
                            const buyerCleanPhone = order.buyerPhone
                              ? order.buyerPhone.replace(/\D/g, "").slice(-10)
                              : "";

                            const orderWaUrl = buyerCleanPhone
                              ? `https://wa.me/91${buyerCleanPhone}?text=Hello%20${encodeURIComponent(
                                  order.buyerName || "Customer"
                                )},%20regarding%20your%20Order%20ID%20${encodeURIComponent(
                                  order.marketplaceOrderId
                                )}%20at%20Lakshmi%20Agency...`
                              : null;

                            return (
                              <tr key={order._id} className="hover:bg-plum-50/30 transition-colors">
                                <td className="p-3.5 font-mono font-bold text-plum-950">
                                  {order.marketplaceOrderId}
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold text-gray-900 truncate max-w-[200px]">
                                    {order.productName || "Product"}
                                  </div>
                                  <div className="text-[10px] text-gold-700 font-semibold">
                                    {order.brandName || "Brand"} • {order.marketplace || "Amazon"}
                                  </div>
                                </td>

                                {user.role === "PREMIUM_USER" && (
                                  <td className="p-3.5">
                                    <div className="font-semibold text-gray-800">{order.buyerName}</div>
                                    <div className="text-[10px] text-gray-400 font-mono">{order.buyerPhone}</div>
                                  </td>
                                )}

                                <td className="p-3.5 font-extrabold text-plum-950">
                                  ₹{order.amount || order.payoutAmount || 0}
                                </td>

                                <td className="p-3.5">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                      order.status === "APPROVED_AND_PAID"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                        : order.status === "REJECTED"
                                        ? "bg-red-100 text-red-800 border border-red-200"
                                        : order.status === "REFUND_FORM_FILLED"
                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                        : "bg-amber-100 text-amber-800 border border-amber-200"
                                    }`}
                                  >
                                    {order.status.replace(/_/g, " ")}
                                  </span>
                                  {order.transactionReference && (
                                    <div className="text-[9px] font-mono text-emerald-700 mt-0.5">
                                      UTR: {order.transactionReference}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5 text-gray-500 text-[11px] whitespace-nowrap">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString("en-IN")
                                    : "—"}
                                </td>

                                <td className="p-3.5 text-right">
                                  {orderWaUrl ? (
                                    <a
                                      href={orderWaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition-colors shadow-2xs"
                                      title="Message Buyer on WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                                      Chat
                                    </a>
                                  ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Lakshmi Agency Member Directory</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-plum-900 text-white font-bold hover:bg-plum-950 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
