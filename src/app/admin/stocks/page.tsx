"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Layers,
  Search,
  RefreshCw,
  Loader2,
  Package,
  Store,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Zap,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function AdminStocksHubPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "HOLD" | "SOLD_OUT">("ALL");
  const [collapsedBrands, setCollapsedBrands] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deals");
      const data = await res.json();
      if (data.success) {
        setDeals((data.deals || []).filter((d: any) => d.dealType !== "No Investment"));
      }
    } catch {
      toast.error("Failed to load stock inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleToggleLive = async (deal: any, makeLive: boolean) => {
    if (makeLive && (deal.remainingSlots ?? 0) <= 0) {
      toast.error("0 stock remaining. Please relist/add stock in Deals Studio first.");
      return;
    }
    setUpdatingId(deal._id);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal._id, isActive: makeLive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          makeLive
            ? `#${deal.productCode} is now LIVE!`
            : `#${deal.productCode} moved to Hold / Archive`
        );
        fetchDeals();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter deals
  const filteredDeals = useMemo(() => {
    const q = search.toLowerCase().trim();
    return deals.filter((d) => {
      const matchesQuery =
        !q ||
        (d.brandName || "").toLowerCase().includes(q) ||
        (d.productName || "").toLowerCase().includes(q) ||
        (d.productCode || "").toLowerCase().includes(q);

      if (!matchesQuery) return false;

      const rem = d.remainingSlots ?? 0;
      const isSoldOut = rem <= 0;
      const isHold = d.isActive === false && rem > 0;
      const isLive = d.isActive !== false && rem > 0;

      if (statusFilter === "ACTIVE") return isLive;
      if (statusFilter === "HOLD") return isHold;
      if (statusFilter === "SOLD_OUT") return isSoldOut;
      return true;
    });
  }, [deals, search, statusFilter]);

  // Group by Brand
  const brandGroups = useMemo(() => {
    const map: Record<string, any> = {};
    for (const d of filteredDeals) {
      const bName = (d.brandName || "General Brand").trim();
      const key = bName.toUpperCase();
      if (!map[key]) {
        map[key] = {
          brandName: bName,
          products: [],
          totalAdded: 0,
          totalRemaining: 0,
          totalSold: 0,
        };
      }
      const added = d.totalSlots ?? 0;
      const rem = Math.max(0, d.remainingSlots ?? 0);
      const sold = Math.max(0, added - rem);

      map[key].products.push(d);
      map[key].totalAdded += added;
      map[key].totalRemaining += rem;
      map[key].totalSold += sold;
    }
    return Object.values(map).sort((a, b) => a.brandName.localeCompare(b.brandName));
  }, [filteredDeals]);

  // Global Totals
  const globalTotals = useMemo(() => {
    let added = 0;
    let remaining = 0;
    let sold = 0;
    const brandSet = new Set<string>();

    for (const d of deals) {
      brandSet.add((d.brandName || "General Brand").trim().toUpperCase());
      const a = d.totalSlots ?? 0;
      const r = Math.max(0, d.remainingSlots ?? 0);
      added += a;
      remaining += r;
      sold += Math.max(0, a - r);
    }

    return {
      totalBrands: brandSet.size,
      totalProducts: deals.length,
      added,
      remaining,
      sold,
    };
  }, [deals]);

  const toggleBrandCollapse = (brandKey: string) => {
    setCollapsedBrands((prev) => ({ ...prev, [brandKey]: !prev[brandKey] }));
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Luxury Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-950 via-plum-900 to-lotus-950 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-400 to-amber-500 text-plum-950 flex items-center justify-center shadow-lg shadow-gold-500/20 shrink-0">
            <Layers className="w-7 h-7 text-plum-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              Live Inventory &amp; Brand Capacity
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1 text-white tracking-tight">
              Stocks Hub
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
              Complete brand-wise and product-wise breakdown of added stock, remaining slots, and sold-out units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Link
            href="/admin/deals"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Manage Deals Studio
          </Link>
          <button
            onClick={fetchDeals}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 4 Global Stock KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-plum-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Brands</span>
            <div className="w-9 h-9 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-plum-950 font-serif">{globalTotals.totalBrands}</span>
            <span className="text-[11px] font-bold text-gray-400">{globalTotals.totalProducts} Products</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-plum-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Added Stock</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-serif">{globalTotals.added}</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Units Added</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-plum-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Remaining Stock</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-serif">{globalTotals.remaining}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Available</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-plum-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sold Out / Used</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-800 font-serif">{globalTotals.sold}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Claimed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-plum-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, product name, or product code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-[#FAF5F8]/60 font-medium"
          />
        </div>

        <div className="w-full sm:w-52">
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
              { value: "ALL", label: "All Stock Statuses" },
              { value: "ACTIVE", label: "🟢 Active / Live" },
              { value: "HOLD", label: "🟡 On Hold / Archived" },
              { value: "SOLD_OUT", label: "🔴 Sold Out (0 Left)" },
            ]}
          />
        </div>
      </div>

      {/* Brand-by-Brand Stock Breakdown */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-plum-100">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-lotus-600 mb-3" />
          <p className="text-xs font-bold text-plum-900">Calculating brand &amp; product stock levels...</p>
        </div>
      ) : brandGroups.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-plum-100">
          <Layers className="w-12 h-12 text-plum-200 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-plum-950 text-base">No Matching Brands or Products</h3>
          <p className="text-xs text-gray-400 mt-1">Try clearing your search or status filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {brandGroups.map((group) => {
            const brandKey = group.brandName.toUpperCase();
            const isCollapsed = Boolean(collapsedBrands[brandKey]);
            const remPercent = group.totalAdded > 0 ? Math.round((group.totalRemaining / group.totalAdded) * 100) : 0;

            return (
              <motion.div
                key={brandKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden"
              >
                {/* Brand Header Summary */}
                <div
                  onClick={() => toggleBrandCollapse(brandKey)}
                  className="p-5 bg-gradient-to-r from-[#FAF5F8] via-white to-gold-50/30 border-b border-plum-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-plum-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-plum-900 to-lotus-800 text-gold-300 font-serif font-black flex items-center justify-center text-lg shadow-xs shrink-0">
                      {group.brandName[0]?.toUpperCase() || "B"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif font-black text-plum-950 text-lg">{group.brandName}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-plum-100 text-plum-900 font-bold text-[10px]">
                          {group.products.length} {group.products.length === 1 ? "Product" : "Products"}
                        </span>
                      </div>
                      <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                          style={{ width: `${remPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-center min-w-[90px]">
                      <span className="text-[9px] font-bold text-indigo-700 uppercase block">Added</span>
                      <span className="text-sm font-black text-indigo-950 font-mono">{group.totalAdded}</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[90px]">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block">Remaining</span>
                      <span className="text-sm font-black text-emerald-800 font-mono">{group.totalRemaining}</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[90px]">
                      <span className="text-[9px] font-bold text-amber-700 uppercase block">Sold / Used</span>
                      <span className="text-sm font-black text-amber-900 font-mono">{group.totalSold}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-plum-100 text-plum-700">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Products Table inside Brand */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-plum-50/40 border-b border-plum-100 text-[10px] font-black uppercase tracking-wider text-gray-500">
                          <th className="py-3 px-5">Product &amp; Code</th>
                          <th className="py-3 px-4 text-center">Review Stock (Add / Rem / Sold)</th>
                          <th className="py-3 px-4 text-center">Rating Stock (Add / Rem / Sold)</th>
                          <th className="py-3 px-4 text-center">Order Only (Add / Rem / Sold)</th>
                          <th className="py-3 px-4 text-center">Total (Add / Rem / Sold)</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-5 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.products.map((d: any) => {
                          const revAdd = d.reviewSlots ?? 0;
                          const revRem = Math.max(0, d.remainingReview ?? 0);
                          const revSold = Math.max(0, revAdd - revRem);

                          const ratAdd = d.ratingSlots ?? 0;
                          const ratRem = Math.max(0, d.remainingRating ?? 0);
                          const ratSold = Math.max(0, ratAdd - ratRem);

                          const ooAdd = d.orderOnlySlots ?? 0;
                          const ooRem = Math.max(0, d.remainingOrderOnly ?? 0);
                          const ooSold = Math.max(0, ooAdd - ooRem);

                          const totAdd = d.totalSlots ?? 0;
                          const totRem = Math.max(0, d.remainingSlots ?? 0);
                          const totSold = Math.max(0, totAdd - totRem);

                          const isSoldOut = totRem <= 0;
                          const isHold = d.isActive === false && !isSoldOut;

                          return (
                            <tr key={d._id} className="hover:bg-plum-50/25 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl relative overflow-hidden border border-gray-100 shrink-0 bg-plum-50/40">
                                    <SafeImage
                                      src={d.productImage}
                                      alt={d.productName}
                                      fill
                                      className="object-contain p-1"
                                      fallbackText={d.brandName}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-plum-950 text-xs sm:text-sm line-clamp-1 max-w-[240px]">
                                      {d.productName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded-md bg-plum-50 text-plum-900 border border-plum-200">
                                        #{d.productCode}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-semibold">{d.marketplace}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-lotus-50/70 border border-lotus-100">
                                  <MessageSquare className="w-3 h-3 text-lotus-600" />
                                  <span className="font-bold text-gray-700">{revAdd}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-black text-emerald-700">{revRem}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-bold text-amber-700">{revSold}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/70 border border-amber-100">
                                  <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                                  <span className="font-bold text-gray-700">{ratAdd}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-black text-emerald-700">{ratRem}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-bold text-amber-700">{ratSold}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/70 border border-indigo-100">
                                  <span className="font-bold text-gray-700">{ooAdd}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-black text-emerald-700">{ooRem}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-bold text-amber-700">{ooSold}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-plum-50 border border-plum-100">
                                  <span className="font-bold text-indigo-900">{totAdd}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-black text-emerald-700">{totRem}</span>
                                  <span className="text-gray-300">/</span>
                                  <span className="font-bold text-amber-700">{totSold}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                {isSoldOut ? (
                                  <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-black text-[10px]">
                                    Sold Out
                                  </span>
                                ) : isHold ? (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-[10px]">
                                    On Hold
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px]">
                                    Live ({totRem} left)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isSoldOut && d.isActive !== false && (
                                    <button
                                      onClick={() => handleToggleLive(d, false)}
                                      disabled={updatingId === d._id}
                                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                    >
                                      <Archive className="w-3 h-3" />
                                      Hold
                                    </button>
                                  )}
                                  {!isSoldOut && d.isActive === false && (
                                    <button
                                      onClick={() => handleToggleLive(d, true)}
                                      disabled={updatingId === d._id}
                                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                    >
                                      <Zap className="w-3 h-3 text-gold-300" />
                                      Make Live
                                    </button>
                                  )}
                                  <Link
                                    href="/admin/deals"
                                    className="px-2.5 py-1.5 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-900 border border-plum-200 font-bold text-[11px]"
                                  >
                                    Edit Stock
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
