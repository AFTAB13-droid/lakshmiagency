"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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
  Trash2,
  UserPlus,
  Clock,
  X,
  RotateCcw,
} from "lucide-react";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import Pagination from "@/components/common/Pagination";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "BUYER_REQUESTS">("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "USER",
  });

  // Approval Action State
  const [processingApprovalId, setProcessingApprovalId] = useState<string | null>(null);
  const [rejectingUser, setRejectingUser] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User status updated");
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteUser = async (user: any) => {
    const confirmed = window.confirm(
      `Permanently remove "${user.name}" (${user.email}) from MongoDB?\n\nOnce deleted, they will be able to register again with this email.`
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
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
      } else {
        toast.error(data.error || "Failed to delete user", { id: toastId });
      }
    } catch {
      toast.error("Network error while deleting user", { id: toastId });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.mobile || !createForm.password) {
      toast.error("Please fill all required fields");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "User created and ready to log in!");
        setUsers((prev) => [data.user, ...prev]);
        setShowCreateModal(false);
        setCreateForm({ name: "", email: "", mobile: "", password: "", role: "USER" });
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch {
      toast.error("Network error while creating user");
    } finally {
      setCreating(false);
    }
  };

  const handleApprovalAction = async (
    userId: string,
    action: "APPROVE" | "REJECT" | "RESET_PENDING",
    reason?: string
  ) => {
    setProcessingApprovalId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          action === "APPROVE"
            ? "User approved & activated!"
            : action === "REJECT"
            ? "User request rejected"
            : "Moved back to pending queue"
        );
        setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
        setRejectingUser(null);
        setRejectReason("");
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingApprovalId(null);
    }
  };

  const buyerRequests = users.filter(
    (u) =>
      u.role === "USER" &&
      (u.mediatorApprovalStatus === "PENDING" || u.mediatorApprovalStatus === "REJECTED")
  );
  const pendingBuyerCount = users.filter(
    (u) => u.role === "USER" && u.mediatorApprovalStatus === "PENDING"
  ).length;

  const filteredUsers = (activeTab === "BUYER_REQUESTS" ? buyerRequests : users).filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.mediatorCode && u.mediatorCode.toLowerCase().includes(q));

    const matchesRole = activeTab === "BUYER_REQUESTS" || roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate paginated slice
  const totalEntries = filteredUsers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, activeTab]);

  // Summary Metrics
  const totalMediators = users.filter((u) => u.role === "PREMIUM_USER").length;
  const totalBuyers = users.filter((u) => u.role === "USER").length;
  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            User Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage registered Buyers and Premium Users (Mediators) with order timeline & WhatsApp messaging
          </p>
        </div>

        {/* Counter Pills & Create Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-gold-500" />
            <span className="text-gray-500">Mediators:</span>
            <strong className="text-plum-950 font-black">{totalMediators}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-plum-600" />
            <span className="text-gray-500">Buyers:</span>
            <strong className="text-plum-950 font-black">{totalBuyers}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500">Active:</span>
            <strong className="text-emerald-700 font-black">{activeUsers}</strong>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-plum-800 to-plum-950 hover:from-plum-700 hover:to-plum-900 text-white text-xs font-black shadow-md shadow-plum-900/15 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 text-gold-400" />
            + Create User
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border ${
            activeTab === "ALL"
              ? "bg-plum-900 text-white border-plum-900 shadow-sm"
              : "bg-white text-plum-900 border-plum-200 hover:bg-plum-50"
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("BUYER_REQUESTS")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
            activeTab === "BUYER_REQUESTS"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Buyer Approval Requests ({buyerRequests.length})
          {pendingBuyerCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "BUYER_REQUESTS"
                  ? "bg-white text-amber-700"
                  : "bg-amber-500 text-white animate-pulse"
              }`}
            >
              {pendingBuyerCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-3xl bg-white border border-plum-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, email, agent code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CustomDropdown
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: "ALL", label: `All Roles (${users.length})` },
              { value: "PREMIUM_USER", label: `Premium Mediators (${totalMediators})` },
              { value: "USER", label: `Buyers (${totalBuyers})` },
              { value: "ADMIN", label: "Admins" },
            ]}
            icon={<Filter className="w-3.5 h-3.5 text-plum-600" />}
            className="w-full sm:w-60"
            size="md"
          />
        </div>
      </div>

      {/* Advanced Animated Table */}
      <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-plum-600" />
            <p className="text-xs font-bold">Loading member directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-plum-700" />
            <p className="text-sm font-bold text-gray-600">No matching members found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search keywords or role filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-plum-50/70 text-plum-900 border-b border-plum-100 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">MEMBER</th>
                  <th className="p-4 sm:p-5">ROLE</th>
                  <th className="p-4 sm:p-5">CONTACT / WHATSAPP</th>
                  <th className="p-4 sm:p-5">AGENT CODE</th>
                  <th className="p-4 sm:p-5">PAYOUT UPI</th>
                  <th className="p-4 sm:p-5 text-center">ACCOUNT</th>
                  <th className="p-4 sm:p-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((u) => {
                  const cleanPhone = u.mobile ? u.mobile.replace(/\D/g, "").slice(-10) : "";
                  const waUrl = cleanPhone
                    ? `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                        u.name
                      )},%20this%20is%20Lakshmi%20Agency%20Admin...`
                    : null;

                  return (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gradient-to-r hover:from-plum-50/40 hover:via-lotus-50/20 hover:to-white transition-all group"
                    >
                      {/* Member Info */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-plum-100 to-lotus-100 text-plum-800 font-serif font-black text-sm flex items-center justify-center shrink-0 border border-plum-200/50 shadow-2xs group-hover:scale-105 transition-transform">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-extrabold text-plum-950 text-sm">{u.name}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4 sm:p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            u.role === "PREMIUM_USER"
                              ? "bg-gold-100 text-plum-950 border border-gold-300 shadow-2xs"
                              : u.role === "ADMIN"
                              ? "bg-plum-100 text-plum-900 border border-plum-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role === "PREMIUM_USER" ? (
                            <>
                              <Award className="w-3.5 h-3.5 text-gold-600" />
                              Premium Mediator
                            </>
                          ) : u.role === "ADMIN" ? (
                            <>
                              <Shield className="w-3.5 h-3.5 text-plum-600" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              Buyer
                            </>
                          )}
                        </span>
                      </td>

                      {/* Contact & 1-Click WhatsApp */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{u.mobile || "—"}</span>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200 transition-all shadow-2xs hover:scale-110 active:scale-95"
                              title="Direct WhatsApp Chat"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Agent Code */}
                      <td className="p-4 sm:p-5 font-mono font-black text-plum-800 text-xs">
                        {u.mediatorCode ? (
                          <span className="px-2.5 py-1 rounded-lg bg-plum-50 border border-plum-200">
                            #{u.mediatorCode}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Payment UPI */}
                      <td className="p-4 sm:p-5">
                        {u.paymentDetails?.upiId ? (
                          <span className="font-mono text-[11px] font-bold text-plum-900 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gold-600" />
                            {u.paymentDetails.upiId}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Not added</span>
                        )}
                      </td>

                      {/* Account Status Toggle */}
                      <td className="p-4 sm:p-5 text-center">
                        {u.mediatorApprovalStatus === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        ) : u.mediatorApprovalStatus === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                            }`}
                          >
                            {u.isActive ? "Active" : "Disabled"}
                          </button>
                        )}
                      </td>

                      {/* Actions: Approval, Details Modal Trigger & Delete */}
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {u.mediatorApprovalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprovalAction(u._id, "APPROVE")}
                                disabled={processingApprovalId === u._id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingUser(u);
                                  setRejectReason("");
                                }}
                                disabled={processingApprovalId === u._id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {u.mediatorApprovalStatus === "REJECTED" && (
                            <button
                              onClick={() => handleApprovalAction(u._id, "RESET_PENDING")}
                              disabled={processingApprovalId === u._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-all disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Re-evaluate
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUserId(u._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white text-xs font-bold shadow-sm shadow-plum-950/20 hover:scale-105 active:scale-95 transition-all"
                            title="View Orders History & Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-gold-300" />
                            <span>Details</span>
                          </button>
                          {u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-all hover:scale-105 active:scale-95"
                              title="Permanently delete user from MongoDB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalEntries={totalEntries}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 40, 50, 100]}
          />
        )}
      </div>

      {/* User Details & Orders History Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Create User Modal (Direct Login without OTP/Approval) */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-plum-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl border border-plum-100 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-plum-900 to-plum-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-gold-400" />
                  <div>
                    <h3 className="font-serif font-bold text-base">Create User Account</h3>
                    <p className="text-[11px] text-plum-200">Pre-approved for immediate login</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-plum-900 uppercase tracking-wider mb-1">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, role: "USER" }))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        createForm.role === "USER"
                          ? "bg-plum-900 text-white border-plum-900 shadow-sm"
                          : "bg-plum-50/50 text-plum-800 border-plum-200 hover:bg-plum-50"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, role: "PREMIUM_USER" }))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        createForm.role === "PREMIUM_USER"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-amber-50/50 text-amber-900 border-amber-200 hover:bg-amber-50"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Premium User
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-plum-900 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-plum-900 uppercase tracking-wider mb-1">
                    Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-plum-900 uppercase tracking-wider mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={createForm.mobile}
                    onChange={(e) => setCreateForm((f) => ({ ...f, mobile: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-plum-900 uppercase tracking-wider mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Set login password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                  This user will be <strong>pre-approved</strong> and can log in immediately using their Email & Password.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-plum-800 to-plum-950 text-white text-xs font-black shadow-md hover:from-plum-700 hover:to-plum-900 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create & Activate
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Buyer Request Modal */}
      <AnimatePresence>
        {rejectingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-plum-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setRejectingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl border border-red-100 shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-red-700">
                  Reject Registration — {rejectingUser.name}
                </h3>
                <button
                  onClick={() => setRejectingUser(null)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Optional reason shown if this user tries to log in:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unverified details or duplicate account..."
                className="w-full p-3 rounded-xl border border-red-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprovalAction(rejectingUser._id, "REJECT", rejectReason)}
                  disabled={processingApprovalId === rejectingUser._id}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
