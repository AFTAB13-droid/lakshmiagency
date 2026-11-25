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
    reviewPricingType: "LESS",
    reviewLessAmount: "",
    reviewCommissionAmount: "",
    ratingPricingType: "LESS",
    ratingLessAmount: "",
    ratingCommissionAmount: "",
    instructions: "",
    paymentTimeline: "",
    reviewSlots: "10",
    ratingSlots: "10",
    dealType: "Original",
    description: "",
    whatsappNumber: "",
    whatsappMessage: "Hey, I want to take the No Investment Deal. Please share details!",
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
      reviewPricingType: "LESS",
      reviewLessAmount: "",
      reviewCommissionAmount: "",
      ratingPricingType: "LESS",
      ratingLessAmount: "",
      ratingCommissionAmount: "",
      instructions: "",
      paymentTimeline: "",
      reviewSlots: "10",
      ratingSlots: "10",
      dealType: "Original",
      description: "",
      whatsappNumber: "",
      whatsappMessage: "Hey, I want to take the No Investment Deal. Please share details!",
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
      reviewPricingType: deal.reviewPricingType || deal.pricingType || "LESS",
      reviewLessAmount: deal.reviewLessAmount !== undefined ? String(deal.reviewLessAmount) : (deal.lessAmount !== undefined ? String(deal.lessAmount) : ""),
      reviewCommissionAmount: deal.reviewCommissionAmount !== undefined ? String(deal.reviewCommissionAmount) : (deal.commissionAmount !== undefined ? String(deal.commissionAmount) : ""),
      ratingPricingType: deal.ratingPricingType || deal.pricingType || "LESS",
      ratingLessAmount: deal.ratingLessAmount !== undefined ? String(deal.ratingLessAmount) : (deal.lessAmount !== undefined ? String(deal.lessAmount) : ""),
      ratingCommissionAmount: deal.ratingCommissionAmount !== undefined ? String(deal.ratingCommissionAmount) : (deal.commissionAmount !== undefined ? String(deal.commissionAmount) : ""),
      instructions: deal.instructions || "",
      paymentTimeline: deal.paymentTimeline || "",
      reviewSlots: deal.reviewSlots !== undefined ? String(deal.reviewSlots) : "10",
      ratingSlots: deal.ratingSlots !== undefined ? String(deal.ratingSlots) : "10",
      dealType: deal.dealType || "Original",
      description: deal.description || "",
      whatsappNumber: deal.whatsappNumber || "",
      whatsappMessage: deal.whatsappMessage || "Hey, I want to take the No Investment Deal. Please share details!",
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
      reviewPricingType: deal.reviewPricingType || deal.pricingType || "LESS",
      reviewLessAmount: deal.reviewLessAmount !== undefined ? String(deal.reviewLessAmount) : (deal.lessAmount !== undefined ? String(deal.lessAmount) : ""),
      reviewCommissionAmount: deal.reviewCommissionAmount !== undefined ? String(deal.reviewCommissionAmount) : (deal.commissionAmount !== undefined ? String(deal.commissionAmount) : ""),
      ratingPricingType: deal.ratingPricingType || deal.pricingType || "LESS",
      ratingLessAmount: deal.ratingLessAmount !== undefined ? String(deal.ratingLessAmount) : (deal.lessAmount !== undefined ? String(deal.lessAmount) : ""),
      ratingCommissionAmount: deal.ratingCommissionAmount !== undefined ? String(deal.ratingCommissionAmount) : (deal.commissionAmount !== undefined ? String(deal.commissionAmount) : ""),
      instructions: deal.instructions || "",
      paymentTimeline: deal.paymentTimeline || "",
      reviewSlots: "10",
      ratingSlots: "10",
      dealType: deal.dealType || "Original",
      description: deal.description || "",
      whatsappNumber: deal.whatsappNumber || "",
      whatsappMessage: deal.whatsappMessage || "Hey, I want to take the No Investment Deal. Please share details!",
    });
    setShowModal(true);
  };

  const handleArchiveDeal = async (deal: any) => {
    const toastId = toast.loading(`Moving #${deal.productCode} to Hold / Archive...`);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal._id, isActive: false }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deal #${deal.productCode} archived (on hold)!`, { id: toastId });
        fetchData();
      } else {
        toast.error(data.error || "Failed to archive deal", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    }
  };

  const handleMakeLiveDirect = async (deal: any) => {
    if ((deal.remainingSlots ?? 0) <= 0) {
      toast("0 stock remaining — set new stock to go live!", { icon: "📦" });
      handleRelist(deal);
      return;
    }
    const toastId = toast.loading(`Making #${deal.productCode} live...`);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal._id, isActive: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deal #${deal.productCode} is now LIVE!`, { id: toastId });
        setActiveTab("active");
        fetchData();
      } else {
        toast.error(data.error || "Failed to activate deal", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    }
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
      const isNoInvestment = formData.dealType === "No Investment";
      const preparedData = { ...formData };
      if (isNoInvestment) {
        preparedData.productName = formData.productName?.trim() || "No Investment Deal";
        preparedData.brandName = formData.brandName?.trim() || "Lakshmi Agency";
        preparedData.marketplace = formData.marketplace || "WhatsApp Direct";
        preparedData.productCode = formData.productCode?.trim() || ("NOINV-" + Date.now().toString().slice(-4));
        preparedData.price = "0";
        preparedData.pricingType = "FULL_REFUND";
        preparedData.lessAmount = "0";
        preparedData.commissionAmount = "0";
        preparedData.reviewSlots = "9999";
        preparedData.ratingSlots = "9999";
        if (!preparedData.productImage) {
          preparedData.productImage = "/logo.jpg";
        }
      } else {
        const revS = Number(formData.reviewSlots) || 0;
        const ratS = Number(formData.ratingSlots) || 0;
        if (revS > 0) {
          preparedData.pricingType = formData.reviewPricingType;
          preparedData.lessAmount = formData.reviewLessAmount || "0";
          preparedData.commissionAmount = formData.reviewCommissionAmount || "0";
        } else if (ratS > 0) {
          preparedData.pricingType = formData.ratingPricingType;
          preparedData.lessAmount = formData.ratingLessAmount || "0";
          preparedData.commissionAmount = formData.ratingCommissionAmount || "0";
        }
      }

      const payload =
        modalMode === "edit" || isRelist
          ? { id: editingDealId, relist: isRelist, ...preparedData }
          : preparedData;

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
  // Active: Deals where isActive !== false AND remainingSlots > 0
  // Archived / On Hold: Deals manually archived (isActive === false) OR sold out (remainingSlots <= 0)
  const activeDealsList = deals.filter((d) => d.isActive !== false && (d.remainingSlots ?? 0) > 0);
  const archivedDealsList = deals.filter((d) => d.isActive === false || (d.remainingSlots ?? 0) <= 0);

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
            Archived / On Hold ({archivedDealsList.length})
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedDeals.map((deal) => (
              <DealCard
                key={deal._id}
                deal={deal}
                mediatorCode="ADMIN"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRelist={handleRelist}
                onArchive={handleArchiveDeal}
                onMakeLive={handleMakeLiveDirect}
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
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-sm">
                        {deal.dealType === "No Investment" ? "₹0 (Free)" : `₹${deal.price}`}
                      </td>
                      <td className="p-4 sm:p-5">
                        {deal.dealType === "No Investment" ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[10px] inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            WhatsApp Deal
                          </span>
                        ) : deal.pricingType === "LESS" ? (
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
                        {deal.dealType === "No Investment" ? (
                          <span className="text-[11px] text-gray-400 font-medium">WhatsApp</span>
                        ) : (
                          <>
                            <div className="font-bold text-gray-800 text-xs">
                              {deal.remainingReview} / {deal.reviewSlots}
                            </div>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-lotus-500"
                                style={{ width: `${(deal.remainingReview / (deal.reviewSlots || 1)) * 100}%` }}
                              />
                            </div>
                          </>
                        )}
                      </td>
                      <td className="p-4 sm:p-5">
                        {deal.dealType === "No Investment" ? (
                          <span className="text-[11px] text-gray-400 font-medium">WhatsApp</span>
                        ) : (
                          <>
                            <div className="font-bold text-gray-800 text-xs">
                              {deal.remainingRating} / {deal.ratingSlots}
                            </div>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-gold-500"
                                style={{ width: `${(deal.remainingRating / (deal.ratingSlots || 1)) * 100}%` }}
                              />
                            </div>
                          </>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-black text-plum-950 text-xs">
                        {deal.dealType === "No Investment" ? "Direct" : `${deal.remainingSlots} / ${deal.totalSlots}`}
                      </td>
                      <td className="p-4 sm:p-5">
                        {deal.isActive === false && !isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300">
                            On Hold (Archived)
                          </span>
                        ) : deal.dealType === "No Investment" ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                            Active (Take Deal)
                          </span>
                        ) : isCompleted ? (
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
                          {(deal.isActive === false || isCompleted) ? (
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={() => handleMakeLiveDirect(deal)}
                                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-2xs hover:opacity-95 transition-all flex items-center gap-1 active:scale-95"
                                  title="Make this deal live immediately"
                                >
                                  <Zap className="w-3.5 h-3.5 text-gold-300" />
                                  <span className="hidden sm:inline text-[11px]">Make Live</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleRelist(deal)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-1 active:scale-95"
                                title="Update stock & relist"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline text-[11px]">Relist</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleArchiveDeal(deal)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all flex items-center gap-1 active:scale-95"
                              title="Hold / Archive deal"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden sm:inline text-[11px]">Hold</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    {
                      id: "No Investment",
                      label: "No Investment",
                      desc: "₹0 Upfront • Take Deal",
                      active: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/25 border-emerald-600 font-black",
                      inactive: "bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-50/70",
                    },
                  ].map((dt) => (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => {
                        const updates: any = { dealType: dt.id };
                        if (dt.id === "No Investment") {
                          if (!formData.productName) updates.productName = "No Investment Deal";
                          if (!formData.price) updates.price = "0";
                          if (!formData.pricingType) updates.pricingType = "FULL_REFUND";
                          if (!formData.productCode) updates.productCode = "NOINV-" + Date.now().toString().slice(-4);
                        }
                        setFormData({ ...formData, ...updates });
                      }}
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

              {/* Special No Investment Deal: Simple 3-Field Green Box UI */}
              {formData.dealType === "No Investment" && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-400 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                        Simple No Investment Deal
                      </span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black shadow-2xs">
                      💎 3 Simple Fields Only
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Deal Title / Campaign Name <span className="text-gray-400 font-normal text-[10px]">(Optional, default: No Investment Deal)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="No Investment Deal"
                      className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      1. Special Deal Description & Instructions * <span className="text-gray-400 font-normal text-[10px]">(Visible on deal card)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Exclusive zero investment campaign. No upfront payment required from user! Contact administration on WhatsApp to reserve deal slot."
                      required
                      className="w-full p-2.5 rounded-xl border border-emerald-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-800 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        2. Admin WhatsApp Number <span className="text-gray-400 font-normal text-[10px]">(For Take Deal action)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="e.g. 919876543210 (Default: Admin Mobile)"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        3. Pre-configured WhatsApp Message
                      </label>
                      <input
                        type="text"
                        value={formData.whatsappMessage}
                        onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                        placeholder="Hey, I want to take the No Investment Deal. Please share details!"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Simple Deal Mode:</strong> Brand, pricing, marketplace, and stock slots are not needed. Buyers &amp; mediators will directly see the &quot;Take Deal (WhatsApp)&quot; button!
                    </span>
                  </div>
                </div>
              )}

              {/* Standard Deal Fields: Hidden when "No Investment" Deal is selected */}
              {formData.dealType !== "No Investment" && (
                <>
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

              {/* Marketplace Price & Granular Feedback Slots (Stock) */}
              <div className="p-4 rounded-2xl bg-gold-50/50 border border-gold-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 block">Price &amp; Granular Feedback Slots (Stock)</span>
                  <span className="text-[11px] font-bold text-gold-700">
                    Total Stock: {(Number(formData.reviewSlots) || 0) + (Number(formData.ratingSlots) || 0)} Units
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-plum-900 mb-1">Marketplace Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="498"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gold-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-bold text-plum-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-plum-900 mb-1">Review Slots (Pics/Text)</label>
                    <input
                      type="number"
                      min="0"
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
                      min="0"
                      value={formData.ratingSlots}
                      onChange={(e) => setFormData({ ...formData, ratingSlots: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gold-200 bg-white text-xs font-bold text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-400"
                    />
                  </div>
                </div>
              </div>

              {/* Per-Feedback-Type Pricing: Review Slots Pricing */}
              {Number(formData.reviewSlots) > 0 && (
                <div className="p-4 rounded-2xl bg-lotus-50/50 border border-lotus-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-lotus-950 flex items-center gap-1.5">
                      📝 Review Deal Pricing <span className="text-[10px] font-bold text-lotus-700 bg-lotus-100 px-2 py-0.5 rounded-full">({formData.reviewSlots} Review Slots)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "LESS", label: "Less Deal" },
                      { id: "FULL_REFUND", label: "Full Refund" },
                      { id: "COMMISSION", label: "Commission Deal" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, reviewPricingType: p.id })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                          formData.reviewPricingType === p.id
                            ? "plum-gradient-bg text-white shadow-sm"
                            : "bg-white text-gray-600 border border-lotus-200 hover:bg-lotus-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {formData.reviewPricingType === "LESS" && (
                    <div>
                      <label className="block text-xs font-semibold text-lotus-950 mb-1">Review Less / Deduction Amount (₹) *</label>
                      <input
                        type="number"
                        value={formData.reviewLessAmount}
                        onChange={(e) => setFormData({ ...formData, reviewLessAmount: e.target.value })}
                        placeholder="e.g. 20"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-lotus-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-lotus-400 font-bold text-amber-700"
                      />
                    </div>
                  )}
                  {formData.reviewPricingType === "COMMISSION" && (
                    <div>
                      <label className="block text-xs font-semibold text-lotus-950 mb-1">Review Commission Payout (₹) *</label>
                      <input
                        type="number"
                        value={formData.reviewCommissionAmount}
                        onChange={(e) => setFormData({ ...formData, reviewCommissionAmount: e.target.value })}
                        placeholder="e.g. 50"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-lotus-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-lotus-400 font-bold text-emerald-700"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Per-Feedback-Type Pricing: Rating Slots Pricing */}
              {Number(formData.ratingSlots) > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      ⭐ Rating Deal Pricing <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">({formData.ratingSlots} Rating Slots)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "LESS", label: "Less Deal" },
                      { id: "FULL_REFUND", label: "Full Refund" },
                      { id: "COMMISSION", label: "Commission Deal" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, ratingPricingType: p.id })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                          formData.ratingPricingType === p.id
                            ? "bg-gradient-to-r from-amber-500 to-gold-600 text-white shadow-sm"
                            : "bg-white text-gray-600 border border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {formData.ratingPricingType === "LESS" && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-950 mb-1">Rating Less / Deduction Amount (₹) *</label>
                      <input
                        type="number"
                        value={formData.ratingLessAmount}
                        onChange={(e) => setFormData({ ...formData, ratingLessAmount: e.target.value })}
                        placeholder="e.g. 50"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-amber-700"
                      />
                    </div>
                  )}
                  {formData.ratingPricingType === "COMMISSION" && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-950 mb-1">Rating Commission Payout (₹) *</label>
                      <input
                        type="number"
                        value={formData.ratingCommissionAmount}
                        onChange={(e) => setFormData({ ...formData, ratingCommissionAmount: e.target.value })}
                        placeholder="e.g. 30"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-emerald-700"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Deal Instructions & Payment Timeline (Shown in Info Popup + WhatsApp Pitch & Announcement) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    ℹ️ Deal Instructions &amp; Payment Timeline
                  </span>
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    Shown in Card Info Popup &amp; Auto-Synced to WhatsApp
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-950 mb-1">
                    Deal Instructions &amp; Review Rules <span className="text-gray-400 font-normal">(e.g. review delete/error rules, steps, conditions)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. Keep review live for at least 30 days. If review is deleted by marketplace or has an error, contact admin immediately..."
                    className="w-full p-2.5 rounded-xl border border-indigo-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-950 mb-1">
                    Payment Timeline &amp; Details
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTimeline}
                    onChange={(e) => setFormData({ ...formData, paymentTimeline: e.target.value })}
                    placeholder="e.g. 20–25 working days after review goes live & Refund Form is submitted"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium"
                  />
                </div>
              </div>
            </>
          )}

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
