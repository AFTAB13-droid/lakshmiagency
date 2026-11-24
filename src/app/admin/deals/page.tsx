"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Tag,
  Plus,
  Search,
  Filter,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Archive,
  RefreshCw,
  Zap,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import SafeImage from "@/components/common/SafeImage";
import DealCard, { getDealTypeBadge } from "@/components/deals/DealCard";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "relist">("create");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form State
  const [formData, setFormData] = useState({
    brandName: "",
    productName: "",
    productCode: "",
    marketplace: "Amazon",
    productLink: "",
    productImage: "",
    price: "",
    pricingType: "LESS",
    lessAmount: "",
    commissionAmount: "",
    reviewSlots: "10",
    ratingSlots: "10",
    dealType: "Original",
  });

  const resetForm = () => {
    setFormData({
      brandName: "",
      productName: "",
      productCode: "",
      marketplace: "Amazon",
      productLink: "",
      productImage: "",
      price: "",
      pricingType: "LESS",
      lessAmount: "",
      commissionAmount: "",
      reviewSlots: "10",
      ratingSlots: "10",
      dealType: "Original",
    });
    setEditingDealId(null);
    setModalMode("create");
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (deal: any) => {
    setModalMode("edit");
    setEditingDealId(deal._id);
    setFormData({
      brandName: deal.brandName || "",
      productName: deal.productName || "",
      productCode: deal.productCode || "",
      marketplace: deal.marketplace || "Amazon",
      productLink: deal.productLink || "",
      productImage: deal.productImage || "",
      price: deal.price !== undefined ? String(deal.price) : "",
      pricingType: deal.pricingType || "LESS",
      lessAmount: deal.lessAmount !== undefined ? String(deal.lessAmount) : "",
      commissionAmount: deal.commissionAmount !== undefined ? String(deal.commissionAmount) : "",
      reviewSlots: deal.reviewSlots !== undefined ? String(deal.reviewSlots) : "10",
      ratingSlots: deal.ratingSlots !== undefined ? String(deal.ratingSlots) : "10",
      dealType: deal.dealType || "Original",
    });
    setShowModal(true);
  };

  const handleRelist = (deal: any) => {
    setModalMode("relist");
    setEditingDealId(deal._id);
    setFormData({
      brandName: deal.brandName || "",
      productName: deal.productName || "",
      productCode: deal.productCode || "",
      marketplace: deal.marketplace || "Amazon",
      productLink: deal.productLink || "",
      productImage: deal.productImage || "",
      price: deal.price !== undefined ? String(deal.price) : "",
      pricingType: deal.pricingType || "LESS",
      lessAmount: deal.lessAmount !== undefined ? String(deal.lessAmount) : "",
      commissionAmount: deal.commissionAmount !== undefined ? String(deal.commissionAmount) : "",
      reviewSlots: "10",
      ratingSlots: "10",
      dealType: deal.dealType || "Original",
    });
    setShowModal(true);
  };

  const handleDelete = async (deal: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete deal #${deal.productCode} (${deal.productName})?\n\nThis will remove the deal and its remaining review slots.`
    );
    if (!confirmed) return;

    const toastId = toast.loading(`Deleting deal #${deal.productCode}...`);
    try {
      const res = await fetch(`/api/admin/deals?id=${deal._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deal #${deal.productCode} deleted successfully!`, { id: toastId });
        setDeals((prev) => prev.filter((d) => d._id !== deal._id));
      } else {
        toast.error(data.error || "Failed to delete deal", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while deleting deal", { id: toastId });
    }
  };

  const fetchData = async () => {
    try {
      const [dealsRes, brandsRes, mktsRes] = await Promise.all([
        fetch("/api/admin/deals"),
        fetch("/api/admin/brands"),
        fetch("/api/admin/marketplaces"),
      ]);
      const dealsData = await dealsRes.json();
      const brandsData = await brandsRes.json();
      const mktsData = await mktsRes.json();

      if (dealsData.success) setDeals(dealsData.deals);
      if (brandsData.success) setBrands(brandsData.brands);
      if (mktsData.success) setMarketplaces(mktsData.marketplaces);
    } catch (err) {
      toast.error("Failed to load deals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/deals";
      const isRelist = modalMode === "relist";
      const method = modalMode === "edit" || isRelist ? "PATCH" : "POST";
      const payload =
        modalMode === "edit" || isRelist
          ? { id: editingDealId, relist: isRelist, ...formData }
          : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          isRelist
            ? "Deal relisted and live with new stock!"
            : modalMode === "edit"
            ? "Deal updated successfully!"
            : "Deal published successfully!"
        );
        setShowModal(false);
        resetForm();
        if (isRelist) {
          setActiveTab("active");
        }
        fetchData();
      } else {
        toast.error(data.error || `Failed to ${modalMode} deal`);
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // Separation:
  // Active: Deals where remainingSlots > 0 (even if rating slots are 0 and review slots remain)
  // Archived: Deals where ALL slots are completely finished (remainingSlots <= 0)
  const activeDealsList = deals.filter((d) => (d.remainingSlots ?? 0) > 0);
  const archivedDealsList = deals.filter((d) => (d.remainingSlots ?? 0) <= 0);

  const baseDeals = activeTab === "active" ? activeDealsList : archivedDealsList;

  const filteredDeals = baseDeals.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.productName?.toLowerCase().includes(q) ||
      d.brandName?.toLowerCase().includes(q) ||
      d.productCode?.toLowerCase().includes(q) ||
      d.marketplace?.toLowerCase().includes(q)
    );
  });

  const totalEntries = filteredDeals.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-plum-900">Deals Studio</h1>
          <p className="text-xs text-gray-500">Manage active campaigns, feedback slot capacity, and pricing models</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl plum-gradient-bg text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          Create New Deal
        </button>
      </div>

      {/* Tab Switcher: Active Deals vs Archived Deals */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-plum-100 shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-plum-50/70 rounded-2xl border border-plum-100">
          <button
            onClick={() => {
              setActiveTab("active");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "plum-gradient-bg text-white shadow-sm"
                : "text-plum-900 hover:bg-plum-100/60"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            Active Campaigns ({activeDealsList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("archived");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "archived"
                ? "bg-plum-950 text-white shadow-sm"
                : "text-gray-500 hover:text-plum-900 hover:bg-plum-100/60"
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            Archived / Sold Out ({archivedDealsList.length})
          </button>
        </div>

        <div className="text-[11px] font-medium px-2">
          {activeTab === "active" ? (
            <span className="text-gray-400">Campaigns with remaining review or rating slots available to users</span>
          ) : (
            <span className="text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              Completed deals with 0 stock. Click &quot;Relist&quot; to add custom stock and reactivate.
            </span>
          )}
        </div>
      </div>

      {/* Search & View Mode Switcher */}
      <div className="p-3.5 bg-white rounded-3xl border border-plum-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search deals by product, brand, code..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-plum-50/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs font-bold text-plum-900 hidden sm:block">
            Total Deals: <span className="text-lotus-600 font-black">{deals.length}</span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-plum-50/70 rounded-2xl border border-plum-100">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "grid"
                  ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                  : "text-gray-400 hover:text-plum-900"
              }`}
              title="Luxury Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "table"
                  ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                  : "text-gray-400 hover:text-plum-900"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deals Presentation */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-plum-600" />
          <p className="text-xs">Loading active deals...</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100">
          <Tag className="w-10 h-10 mx-auto mb-2 opacity-30 text-plum-700" />
          <p className="text-xs font-semibold text-gray-600">No deals match criteria</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;Create New Deal&quot; to publish your first campaign.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {paginatedDeals.map((deal) => (
              <DealCard
                key={deal._id}
                deal={deal}
                mediatorCode="ADMIN"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRelist={handleRelist}
                isAdmin={true}
              />
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-plum-100 p-2 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-plum-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-plum-50/70 text-plum-900 border-b border-plum-100 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">PRODUCT / BRAND</th>
                  <th className="p-4 sm:p-5">DEAL TYPE</th>
                  <th className="p-4 sm:p-5">PLATFORM</th>
                  <th className="p-4 sm:p-5">PRICE</th>
                  <th className="p-4 sm:p-5">PRICING MODEL</th>
                  <th className="p-4 sm:p-5">REVIEW SLOTS</th>
                  <th className="p-4 sm:p-5">RATING SLOTS</th>
                  <th className="p-4 sm:p-5">TOTAL SLOTS</th>
                  <th className="p-4 sm:p-5">STATUS</th>
                  <th className="p-4 sm:p-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedDeals.map((deal) => {
                  const dealTypeBadge = getDealTypeBadge(deal.dealType);
                  const isCompleted = (deal.remainingSlots ?? 0) <= 0;
                  return (
                    <tr key={deal._id} className="hover:bg-plum-50/20 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl overflow-hidden relative border border-gray-100 shrink-0 shadow-2xs">
                            <SafeImage
                              src={deal.productImage}
                              alt="Product"
                              fill
                              className="object-cover"
                              fallbackText={deal.brandName}
                            />
                          </div>
                          <div>
                            <div className="font-extrabold text-plum-950 text-sm">{deal.productName}</div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-lotus-600">{deal.brandName}</span>
                              <span>&bull;</span>
                              <span className="font-mono text-gray-500 font-bold">#{deal.productCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] border ${dealTypeBadge.bg}`}>
                          {dealTypeBadge.label}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px]">
                          {deal.marketplace}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-sm">₹{deal.price}</td>
                      <td className="p-4 sm:p-5">
                        {deal.pricingType === "LESS" ? (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-black text-[10px]">
                            Less ₹{deal.lessAmount}
                          </span>
                        ) : deal.pricingType === "COMMISSION" ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px]">
                            +₹{deal.commissionAmount} Commission
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-black text-[10px]">
                            100% Full Refund
                          </span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-gray-800 text-xs">
                          {deal.remainingReview} / {deal.reviewSlots}
                        </div>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-lotus-500"
                            style={{ width: `${(deal.remainingReview / (deal.reviewSlots || 1)) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-gray-800 text-xs">
                          {deal.remainingRating} / {deal.ratingSlots}
                        </div>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gold-500"
                            style={{ width: `${(deal.remainingRating / (deal.ratingSlots || 1)) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-xs">
                        {deal.remainingSlots} / {deal.totalSlots}
                      </td>
                      <td className="p-4 sm:p-5">
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] border border-gray-300">
                            Sold Out (Archived)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Active ({deal.remainingSlots} Left)
                          </span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted && (
                            <button
                              onClick={() => handleRelist(deal)}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs shadow-2xs hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-1 active:scale-95"
                              title="Relist completed deal with new stock"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
                              <span className="hidden sm:inline text-[11px]">Relist</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(deal)}
                            className="p-2 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-900 border border-plum-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                            title="Edit Deal"
                          >
                            <Pencil className="w-3.5 h-3.5 text-plum-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(deal)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalEntries={totalEntries}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Create / Edit Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-plum-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center font-bold">
                  {modalMode === "relist" ? (
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                  ) : modalMode === "edit" ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-plum-900 text-base">
                    {modalMode === "relist"
                      ? "Relist Completed Deal"
                      : modalMode === "edit"
                      ? "Edit Deal Campaign"
                      : "Create New Deal"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {modalMode === "relist"
                      ? "Set custom new stock slots to immediately reactivate this deal for buyers & mediators"
                      : modalMode === "edit"
                      ? "Update pricing, deal type, review slot counts, or listing links"
                      : "Configure product details, pricing model, and granular slots"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Deal Type Selector (Original / Exchange / Empty Box) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-plum-50/70 via-lotus-50/30 to-gold-50/30 border border-plum-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-plum-900">
                    Deal Type *
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Selected: <strong className="text-plum-950 font-black">{formData.dealType}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "Original",
                      label: "Original",
                      desc: "Authentic Product",
                      active: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-indigo-600",
                      inactive: "bg-white text-indigo-950 border-indigo-100 hover:bg-indigo-50/60",
                    },
                    {
                      id: "Exchange",
                      label: "Exchange",
                      desc: "Exchange / Swap",
                      active: "bg-amber-600 text-white shadow-md shadow-amber-600/20 border-amber-600",
                      inactive: "bg-white text-amber-950 border-amber-100 hover:bg-amber-50/60",
                    },
                    {
                      id: "Empty Box",
                      label: "Empty Box",
                      desc: "Empty Box Deal",
                      active: "bg-rose-600 text-white shadow-md shadow-rose-600/20 border-rose-600",
                      inactive: "bg-white text-rose-950 border-rose-100 hover:bg-rose-50/60",
                    },
                  ].map((dt) => (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dealType: dt.id })}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                        formData.dealType === dt.id ? dt.active : dt.inactive
                      }`}
                    >
                      <div className="text-xs font-black">{dt.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 font-medium ${
                          formData.dealType === dt.id ? "text-white/80" : "text-gray-400"
                        }`}
                      >
                        {dt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Brand Name *</label>
                  <CustomDropdown
                    value={formData.brandName}
                    onChange={(val) => setFormData({ ...formData, brandName: val })}
                    options={brands.map((b) => ({ value: b.name, label: b.name }))}
                    placeholder="Select Brand"
                    searchable={true}
                    className="w-full"
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Marketplace / Platform *</label>
                  <CustomDropdown
                    value={formData.marketplace}
                    onChange={(val) => setFormData({ ...formData, marketplace: val })}
                    options={marketplaces.map((m) => ({ value: m.name, label: m.name }))}
                    placeholder="Select Marketplace"
                    className="w-full"
                    size="md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Organic Hing Powder 100g"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Unique Product Code (ASIN/SKU) *</label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. AYU-HING-100"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Product URL (Amazon/Flipkart Link)</label>
                  <input
                    type="url"
                    value={formData.productLink}
                    onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                    placeholder="https://amazon.in/dp/..."
                    className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-plum-900 mb-1">Product Image (Upload or CDN URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.productImage}
                      onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
                    />
                    <label className="px-3 py-2 rounded-xl bg-plum-50 hover:bg-plum-100 border border-plum-200 text-plum-800 text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const toastId = toast.loading("Uploading to Cloudinary...");
                          try {
                            const data = new FormData();
                            data.append("file", file);
                            data.append("folder", "lakshmi_agency/deals");
                            const res = await fetch("/api/upload", { method: "POST", body: data });
                            const json = await res.json();
                            if (json.success && json.url) {
                              setFormData((prev) => ({ ...prev, productImage: json.url }));
                              toast.success("Image uploaded to Cloudinary!", { id: toastId });
                            } else {
                              toast.error(json.error || "Upload failed", { id: toastId });
                            }
                          } catch (err) {
                            toast.error("Upload error", { id: toastId });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing Type Switcher */}
              <div className="p-4 rounded-2xl bg-plum-50/60 border border-plum-100 space-y-3">
                <span className="text-xs font-bold text-plum-900 block">Pricing & Payout Model</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "LESS", label: "Less Deal" },
                    { id: "FULL_REFUND", label: "Full Refund" },
                    { id: "COMMISSION", label: "Commission Deal" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, pricingType: p.id })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        formData.pricingType === p.id
                          ? "plum-gradient-bg text-white shadow-sm"
                          : "bg-white text-gray-600 border border-plum-100 hover:bg-plum-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-plum-900 mb-1">Marketplace Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="498"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 font-bold"
                    />
                  </div>

                  {formData.pricingType === "LESS" && (
                    <div>
                      <label className="block text-xs font-semibold text-plum-900 mb-1">Less / Deduction Amount (₹) *</label>
                      <input
                        type="number"
                        value={formData.lessAmount}
                        onChange={(e) => setFormData({ ...formData, lessAmount: e.target.value })}
                        placeholder="20"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 font-bold text-amber-700"
                      />
                    </div>
                  )}

                  {formData.pricingType === "COMMISSION" && (
                    <div>
                      <label className="block text-xs font-semibold text-plum-900 mb-1">Commission Payout (₹) *</label>
                      <input
                        type="number"
                        value={formData.commissionAmount}
                        onChange={(e) => setFormData({ ...formData, commissionAmount: e.target.value })}
                        placeholder="25"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 font-bold text-emerald-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Granular Feedback Slots */}
              <div className="p-4 rounded-2xl bg-gold-50/50 border border-gold-200/70 space-y-3">
                <span className="text-xs font-bold text-plum-900 block">Granular Feedback Slots (Stock)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-plum-900 mb-1">Review Slots (Pics/Text)</label>
                    <input
                      type="number"
                      value={formData.reviewSlots}
                      onChange={(e) => setFormData({ ...formData, reviewSlots: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gold-200 bg-white text-xs font-bold text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-plum-900 mb-1">Rating Slots (Stars only)</label>
                    <input
                      type="number"
                      value={formData.ratingSlots}
                      onChange={(e) => setFormData({ ...formData, ratingSlots: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gold-200 bg-white text-xs font-bold text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-400"
                    />
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-gold-700">
                  Total Deal Stock: {(Number(formData.reviewSlots) || 0) + (Number(formData.ratingSlots) || 0)} Units
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl plum-gradient-bg text-white text-xs font-bold shadow hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {modalMode === "relist"
                    ? "Relist with New Stock"
                    : modalMode === "edit"
                    ? "Save Changes"
                    : "Publish Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
