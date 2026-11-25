"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  Award,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  MessageCircle,
  ExternalLink,
  Filter,
  UserCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  Copy,
  Check,
  RefreshCw,
  X,
  Package,
  Calendar,
  Layers,
  Tag,
  Trash2,
  SlidersHorizontal,
  Pencil,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function AdminMediatorsPage() {
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "ALL_MEDIATORS">("REQUESTS");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Data states
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedMediators, setApprovedMediators] = useState<any[]>([]);
  const [rejectedMediators, setRejectedMediators] = useState<any[]>([]);
  const [allMediators, setAllMediators] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalMediators: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState<"ALL" | "PENDING" | "REJECTED">("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Order Details Modal states
  const [selectedMediatorOrders, setSelectedMediatorOrders] = useState<any | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [mediatorOrdersData, setMediatorOrdersData] = useState<any | null>(null);
  const [orderSearch, setOrderSearch] = useState("");

  // Approval Modal
  const [approvingMediator, setApprovingMediator] = useState<any | null>(null);

  // Rejection Modal
  const [rejectingMediator, setRejectingMediator] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all mediators
  const fetchMediators = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/mediators");
      const data = await res.json();
      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
        setApprovedMediators(data.approvedMediators || []);
        setRejectedMediators(data.rejectedMediators || []);
        setAllMediators(data.allMediators || []);
        setSummary(
          data.summary || {
            totalMediators: 0,
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
          }
        );
      } else {
        toast.error(data.error || "Failed to load mediators");
      }
    } catch (err: any) {
      toast.error("Failed to load mediators data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediators();
  }, []);

  // Reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, requestFilter]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Open Orders Drawer
  const handleViewOrders = async (mediator: any) => {
    setSelectedMediatorOrders(mediator);
    setOrdersLoading(true);
    setOrderSearch("");
    try {
      const res = await fetch(`/api/admin/users/${mediator._id}/orders`);
      const data = await res.json();
      if (data.success) {
        setMediatorOrdersData(data);
      } else {
        toast.error("Failed to load mediator orders");
      }
    } catch (err) {
      toast.error("Error loading orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handle Approve
  const handleConfirmApprove = async () => {
    if (!approvingMediator) return;
    setActionLoading(approvingMediator._id);
    try {
      const res = await fetch("/api/admin/mediators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediatorId: approvingMediator._id,
          action: "APPROVE",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Mediator approved successfully!");
        setApprovingMediator(null);
        fetchMediators();
      } else {
        toast.error(data.error || "Failed to approve mediator");
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!rejectingMediator) return;
    setActionLoading(rejectingMediator._id);
    try {
      const res = await fetch("/api/admin/mediators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediatorId: rejectingMediator._id,
          action: "REJECT",
          reason: rejectionReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Mediator request rejected.");
        setRejectingMediator(null);
        setRejectionReason("");
        fetchMediators();
      } else {
        toast.error(data.error || "Failed to reject mediator");
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reset to Pending
  const handleResetToPending = async (mediatorId: string) => {
    setActionLoading(mediatorId);
    try {
      const res = await fetch("/api/admin/mediators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediatorId,
          action: "RESET_PENDING",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchMediators();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to reset status");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (mediatorId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/mediators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediatorId,
          action: "TOGGLE_ACTIVE",
          isActive: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchMediators();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDeletePremiumUser = async (user: any) => {
    const confirmed = window.confirm(
      `Permanently remove "${user.name}" (${user.email}) from MongoDB?\n\nOnce deleted, they can register again with this email.`
    );
    if (!confirmed) return;

    const toastId = toast.loading(`Removing ${user.name}...`);
    try {
      const res = await fetch(`/api/admin/users?id=${user._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "User permanently deleted!", { id: toastId });
        fetchMediators();
      } else {
        toast.error(data.error || "Failed to delete user", { id: toastId });
      }
    } catch {
      toast.error("Network error while deleting user", { id: toastId });
    }
  };

  // Filtered lists based on active tab and search
  const currentTabItems = useMemo(() => {
    if (activeTab === "REQUESTS") {
      let list =
        requestFilter === "ALL"
          ? [...pendingRequests, ...rejectedMediators]
          : requestFilter === "PENDING"
          ? pendingRequests
          : rejectedMediators;

      if (!search.trim()) return list;

      const q = search.toLowerCase();
      return list.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          (m.mobile && m.mobile.includes(q)) ||
          (m.mediatorCode && m.mediatorCode.toLowerCase().includes(q))
      );
    } else {
      // ALL_MEDIATORS tab (Approved mediators)
      if (!search.trim()) return approvedMediators;

      const q = search.toLowerCase();
      return approvedMediators.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          (m.mobile && m.mobile.includes(q)) ||
          (m.mediatorCode && m.mediatorCode.toLowerCase().includes(q))
      );
    }
  }, [activeTab, pendingRequests, rejectedMediators, approvedMediators, search, requestFilter]);

  // Paginated Slice
  const totalEntries = currentTabItems.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = currentTabItems.slice(startIndex, startIndex + pageSize);

  // Status Badge Styling Helper
  const getApprovalBadge = (status: string) => {
    if (status === "PENDING") {
      return {
        bg: "bg-amber-100 text-amber-900 border-amber-300",
        label: "⏳ Under Verification",
      };
    }
    if (status === "REJECTED") {
      return {
        bg: "bg-red-100 text-red-900 border-red-300",
        label: "❌ Rejected",
      };
    }
    return {
      bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
      label: "✅ Approved",
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-950 via-plum-900 to-lotus-950 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 text-plum-950 flex items-center justify-center font-black shadow-lg shadow-gold-500/20 shrink-0">
            <Award className="w-7 h-7 text-plum-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              <Sparkles className="w-3 h-3 text-gold-400" />
              Mediation & Agent Oversight Desk
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1 text-white tracking-tight">
              Premium Users Hub
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
              Verify registration requests, approve Premium Users, control login access, and inspect their submitted orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={fetchMediators}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div
          onClick={() => {
            setActiveTab("REQUESTS");
            setRequestFilter("PENDING");
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "REQUESTS" && requestFilter === "PENDING"
              ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/50"
              : "bg-white border-plum-100 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-950 font-serif">
              {summary.pendingCount}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
              Awaiting Review
            </span>
          </div>
        </div>

        {/* Active Approved Mediators */}
        <div
          onClick={() => setActiveTab("ALL_MEDIATORS")}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "ALL_MEDIATORS"
              ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/50"
              : "bg-white border-plum-100 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Active Mediators
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif">
              {summary.approvedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Verified Agents
            </span>
          </div>
        </div>

        {/* Rejected Requests */}
        <div
          onClick={() => {
            setActiveTab("REQUESTS");
            setRequestFilter("REJECTED");
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "REQUESTS" && requestFilter === "REJECTED"
              ? "bg-red-50/90 border-red-300 ring-2 ring-red-400/50"
              : "bg-white border-plum-100 hover:border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Rejected Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-950 font-serif">
              {summary.rejectedCount}
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md">
              Denied Access
            </span>
          </div>
        </div>

        {/* Total Registered Applications */}
        <div className="p-4 rounded-3xl bg-white border border-plum-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-plum-950 font-serif">
              {summary.totalMediators}
            </span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              Lifetime Agents
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Tab Navigation Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-plum-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 2 Main Tabs */}
        <div className="flex items-center p-1.5 bg-[#FAF5F8] rounded-2xl border border-plum-200/60 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "REQUESTS"
                ? "bg-white text-plum-950 shadow-md border border-plum-200"
                : "text-gray-500 hover:text-plum-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Premium Approval Requests
            {summary.pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] animate-pulse">
                {summary.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ALL_MEDIATORS")}
            className={`flex-1 md:flex-initial py-2.5 px-5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === "ALL_MEDIATORS"
                ? "bg-white text-plum-950 shadow-md border border-plum-200"
                : "text-gray-500 hover:text-plum-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-gold-600" />
            All Premium Users
            <span className="px-2 py-0.5 rounded-full bg-plum-100 text-plum-900 font-mono text-[10px]">
              {summary.approvedCount}
            </span>
          </button>
        </div>

        {/* Search & Sub-filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === "REQUESTS" && (
            <div className="shrink-0 w-44">
              <CustomDropdown
                value={requestFilter}
                onChange={(val) => setRequestFilter(val as any)}
                options={[
                  { value: "ALL", label: "All Requests" },
                  { value: "PENDING", label: `⏳ Pending (${summary.pendingCount})` },
                  { value: "REJECTED", label: `❌ Rejected (${summary.rejectedCount})` },
                ]}
              />
            </div>
          )}

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-[#FAF5F8]/60"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Table View */}
      <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-lotus-600 mb-3" />
            <p className="text-xs font-bold text-plum-900">Loading mediators database...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="py-24 text-center px-4">
            <Award className="w-12 h-12 text-plum-200 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-plum-950 text-base">
              {activeTab === "REQUESTS"
                ? "No Pending Verification Requests"
                : "No Verified Mediators Found"}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {activeTab === "REQUESTS"
                ? "All registered mediator applications have been evaluated or no new requests submitted."
                : "Try adjusting your search criteria or approving pending mediator requests."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-plum-100 bg-[#FAF5F8]/70 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5">Premium User</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  {activeTab === "ALL_MEDIATORS" && (
                    <th className="py-3.5 px-4 text-center">Submitted Orders</th>
                  )}
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-plum-50 text-xs">
                {paginatedItems.map((mediator) => {
                  const statusBadge = getApprovalBadge(mediator.mediatorApprovalStatus);
                  const cleanPhone = (mediator.mobile || "").replace(/\D/g, "").slice(-10);
                  const isApproving = actionLoading === mediator._id;

                  return (
                    <tr
                      key={mediator._id}
                      className="hover:bg-plum-50/40 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-plum-900 to-lotus-800 text-gold-300 font-serif font-black flex items-center justify-center shrink-0 shadow-xs text-sm">
                            {mediator.name ? mediator.name[0].toUpperCase() : "M"}
                          </div>
                          <div>
                            <div className="font-bold text-plum-950 text-sm group-hover:text-lotus-700 transition-colors">
                              {mediator.name}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              Registered:{" "}
                              {new Date(mediator.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-plum-950 text-xs">
                              {mediator.mobile}
                            </span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                                  mediator.name
                                )},%20regarding%20your%20mediator%20account%20at%20Lakshmi%20Agency...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                            {mediator.email}
                          </div>
                        </div>
                      </td>

                      {/* Orders Summary (for All Premium Users tab) */}
                      {activeTab === "ALL_MEDIATORS" && (
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-black text-plum-950 text-sm">
                              {mediator.stats?.totalOrders || 0} Orders
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              ₹{mediator.stats?.totalAmount || 0} volume
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusBadge.bg}`}
                          >
                            {statusBadge.label}
                          </span>
                          {activeTab === "ALL_MEDIATORS" && (
                            <button
                              onClick={() => handleToggleActive(mediator._id, mediator.isActive)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                                mediator.isActive
                                  ? "text-emerald-700 hover:text-emerald-900 bg-emerald-50"
                                  : "text-red-700 hover:text-red-900 bg-red-50"
                              }`}
                            >
                              {mediator.isActive ? "● Active (Click to lock)" : "○ Locked (Click to activate)"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "REQUESTS" ? (
                            <>
                              {mediator.mediatorApprovalStatus === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setApprovingMediator(mediator);
                                    }}
                                    disabled={isApproving}
                                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1 active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Approve
                                  </button>

                                  <button
                                    onClick={() => {
                                      setRejectingMediator(mediator);
                                      setRejectionReason("");
                                    }}
                                    disabled={isApproving}
                                    className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors flex items-center gap-1 active:scale-95"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {mediator.mediatorApprovalStatus === "REJECTED" && (
                                <button
                                  onClick={() => handleResetToPending(mediator._id)}
                                  disabled={isApproving}
                                  className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1 active:scale-95"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Re-evaluate (Pending)
                                </button>
                              )}
                            </>
                          ) : (
                            /* All Premium Users Tab Actions */
                            <>
                              <button
                                onClick={() => handleViewOrders(mediator)}
                                className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white font-bold text-xs shadow-md shadow-plum-950/15 transition-all flex items-center gap-1.5 active:scale-95"
                                title="Inspect all Order & Refund forms submitted by this Premium User"
                              >
                                <Package className="w-3.5 h-3.5 text-gold-300" />
                                All Orders
                              </button>
                              <button
                                onClick={() => handleDeletePremiumUser(mediator)}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors active:scale-95"
                                title="Permanently delete Premium User from MongoDB"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {activeTab === "REQUESTS" && (
                            <button
                              onClick={() => handleDeletePremiumUser(mediator)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors active:scale-95"
                              title="Permanently delete request from MongoDB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredItemsCount(totalEntries) > 0 && (
          <div className="p-4 border-t border-plum-100 bg-[#FAF5F8]/40">
            <Pagination
              currentPage={currentPage}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📦 MODAL: MEDIATOR ALL ORDERS INSPECTION DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedMediatorOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-plum-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gold-300/40 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-plum-950 via-plum-900 to-lotus-950 text-white flex items-center justify-between border-b border-gold-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 text-plum-950 font-serif font-black text-xl flex items-center justify-center shadow-inner shrink-0">
                    {selectedMediatorOrders.name ? selectedMediatorOrders.name[0].toUpperCase() : "M"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                        {selectedMediatorOrders.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-gold-400 text-plum-950 font-mono font-black text-xs">
                        #{selectedMediatorOrders.mediatorCode}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      Phone: {selectedMediatorOrders.mobile} • Email: {selectedMediatorOrders.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedMediatorOrders(null);
                    setMediatorOrdersData(null);
                  }}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF5F8] border-b border-plum-100">
                <div className="p-3 rounded-2xl bg-white border border-plum-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Orders</span>
                  <span className="text-xl font-black text-plum-950 font-mono">
                    {mediatorOrdersData?.stats?.totalOrders || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-plum-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Paid & Completed</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {mediatorOrdersData?.stats?.approvedPaid || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-plum-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Pending Processing</span>
                  <span className="text-xl font-black text-amber-700 font-mono">
                    {mediatorOrdersData?.stats?.pendingRefunds || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-plum-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Value</span>
                  <span className="text-xl font-black text-plum-900 font-mono">
                    ₹{mediatorOrdersData?.stats?.totalAmount || 0}
                  </span>
                </div>
              </div>

              {/* Orders Search Filter */}
              <div className="p-4 border-b border-plum-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID, Buyer Name, Product, or Status..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing {filterOrders(mediatorOrdersData?.orders || [], orderSearch).length} orders
                </div>
              </div>

              {/* Orders List Table */}
              <div className="flex-1 overflow-y-auto p-4">
                {ordersLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-lotus-600 mb-2" />
                    <p className="text-xs font-bold text-gray-500">Fetching mediator orders stream...</p>
                  </div>
                ) : filterOrders(mediatorOrdersData?.orders || [], orderSearch).length === 0 ? (
                  <div className="py-20 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-700 text-sm">No Orders Found</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      No order forms have been submitted under agent code #{selectedMediatorOrders.mediatorCode}.
                    </p>
                  </div>
                ) : (
                  <div className="border border-plum-100 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF5F8] border-b border-plum-100 text-[10px] font-black uppercase tracking-wider text-gray-500">
                          <th className="py-3 px-4">Marketplace Order ID</th>
                          <th className="py-3 px-4">Product Details</th>
                          <th className="py-3 px-4">Buyer Details</th>
                          <th className="py-3 px-4 text-center">Refund Amount</th>
                          <th className="py-3 px-4 text-center">Lifecycle Status</th>
                          <th className="py-3 px-4 text-right">Order Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filterOrders(mediatorOrdersData?.orders || [], orderSearch).map((o: any) => (
                          <tr key={o._id} className="hover:bg-plum-50/30 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-plum-950">
                              <div className="flex items-center gap-1.5">
                                <span>{o.marketplaceOrderId}</span>
                                {o.marketplace && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 uppercase font-sans">
                                    {o.marketplace}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">
                                {o.productName || "Deal Product"}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                #{o.productCode || "GENERAL"} {o.brandName ? `• ${o.brandName}` : ""}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-gray-900">{o.buyerName || "Buyer"}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{o.buyerPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-700">
                              {o.status === "ORDER_FILLED" ? (
                                <span className="text-gray-400">-</span>
                              ) : (
                                `₹${o.payoutAmount || o.amount || 0}`
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getOrderStatusBadge(
                                  o.status
                                )}`}
                              >
                                {o.status?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-gray-500 font-mono text-[11px]">
                              {o.orderDate
                                ? new Date(o.orderDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit",
                                  })
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-plum-100 bg-[#FAF5F8] flex items-center justify-between">
                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-lotus-700 hover:text-lotus-800 flex items-center gap-1"
                >
                  Go to Master Orders Table &rarr;
                </Link>
                <button
                  onClick={() => {
                    setSelectedMediatorOrders(null);
                    setMediatorOrdersData(null);
                  }}
                  className="py-2 px-5 rounded-xl bg-plum-900 text-white font-bold text-xs hover:bg-plum-950 transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ✅ APPROVE CONFIRMATION MODAL WITH CUSTOM CODE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {approvingMediator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-emerald-300 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-black text-plum-950">
                  Approve Premium User
                </h3>
                <p className="text-xs text-gray-500">
                  You are activating login access for <strong>{approvingMediator.name}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF5F8] border border-plum-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-bold text-plum-950">{approvingMediator.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mobile:</span>
                  <span className="font-bold text-plum-950">{approvingMediator.mobile}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingMediator(null)}
                  className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-700/20"
                >
                  Confirm & Activate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ❌ REJECT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectingMediator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-300 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-black text-plum-950">
                  Reject Mediator Application
                </h3>
                <p className="text-xs text-gray-500">
                  Deny login access for <strong>{rejectingMediator.name}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  Rejection Reason (Shown to mediator):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Identity verification could not be completed. Please contact admin."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingMediator(null)}
                  className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs hover:from-red-500 hover:to-rose-600 shadow-md shadow-red-700/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers
function filteredItemsCount(total: number) {
  return total;
}

function filterOrders(orders: any[], query: string) {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.marketplaceOrderId?.toLowerCase().includes(q) ||
      o.productName?.toLowerCase().includes(q) ||
      o.brandName?.toLowerCase().includes(q) ||
      o.buyerName?.toLowerCase().includes(q) ||
      o.buyerPhone?.includes(q) ||
      o.status?.toLowerCase().includes(q)
  );
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "ORDER_FILLED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "HOLDING_PERIOD":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REFUND_FORM_FILLED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "APPROVED_AND_PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    case "CANCELLED":
      return "bg-gray-50 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}
