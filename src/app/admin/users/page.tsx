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
} from "lucide-react";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import Pagination from "@/components/common/Pagination";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.mediatorCode && u.mediatorCode.toLowerCase().includes(q));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate paginated slice
  const totalEntries = filteredUsers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

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

        {/* Counter Pills */}
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
        </div>
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
                      </td>

                      {/* Actions: Details Modal Trigger & WhatsApp */}
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUserId(u._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white text-xs font-bold shadow-sm shadow-plum-950/20 hover:scale-105 active:scale-95 transition-all"
                            title="View Orders History & Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-gold-300" />
                            <span>Details</span>
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
        {filteredUsers.length > 0 && (
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

      {/* User Details & Orders History Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
