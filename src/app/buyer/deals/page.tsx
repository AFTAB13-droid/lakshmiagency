"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import SafeImage from "@/components/common/SafeImage";
import Pagination from "@/components/common/Pagination";
import ThreeEmblem from "@/components/common/ThreeEmblem";
import CustomDropdown from "@/components/common/CustomDropdown";
import {
  getDealTypeBadge,
  formatPricingLabel,
  buildPrefilledOrderFormUrl,
  AnimatedInfoButton,
  DealInfoModal,
  ProductImageLightbox,
} from "@/components/deals/DealCard";
import {
  Tag,
  Search,
  ExternalLink,
  ShoppingBag,
  RotateCcw,
  Star,
  MessageSquare,
  Sparkles,
  Filter,
  Check,
  Copy,
  ChevronRight,
  Info,
  LayoutGrid,
  Rows,
  Layers,
  MessageCircle,
} from "lucide-react";

export default function BuyerDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("ALL");
  const [pricingFilter, setPricingFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"column" | "row">("column");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Copied & Info Modal states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [infoModalDeal, setInfoModalDeal] = useState<any | null>(null);
  const [lightboxDeal, setLightboxDeal] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDeals(data.deals || []);
          if (data.setting) setSettings(data.setting);
        }
      })
      .catch((err) => console.error("Failed to load buyer deals:", err))
      .finally(() => setLoading(false));
  }, []);

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, marketplaceFilter, pricingFilter]);

  // Dynamic Marketplace detection & badge styling
  const getMarketplaceInfo = (marketplace?: string, productLink?: string) => {
    const link = (productLink || "").toLowerCase();
    const m = (marketplace || "").toLowerCase();

    if (link.includes("flipkart.com") || m.includes("flipkart")) {
      return {
        bg: "bg-[#2874F0] text-white border-blue-400/40",
        btnBg: "bg-gradient-to-r from-[#2874F0] to-[#1a5bc7] hover:from-[#2065d6] hover:to-[#1349a3] text-white shadow-blue-500/20",
        label: "Flipkart",
      };
    }
    if (link.includes("amazon.") || link.includes("amzn.") || m.includes("amazon")) {
      return {
        bg: "bg-[#232F3E] text-[#FF9900] border-[#FF9900]/30",
        btnBg: "bg-gradient-to-r from-[#232F3E] to-[#131921] hover:from-[#131921] hover:to-[#0b0e13] text-[#FF9900] shadow-amber-500/15",
        label: "Amazon",
      };
    }
    if (link.includes("myntra.com") || m.includes("myntra")) {
      return {
        bg: "bg-[#FF3F6C] text-white border-pink-400/40",
        btnBg: "bg-gradient-to-r from-[#FF3F6C] to-[#d62650] hover:from-[#e0325d] hover:to-[#be1f44] text-white shadow-pink-500/20",
        label: "Myntra",
      };
    }
    if (link.includes("meesho.com") || m.includes("meesho")) {
      return {
        bg: "bg-[#9F2089] text-white border-purple-400/40",
        btnBg: "bg-gradient-to-r from-[#9F2089] to-[#791566] hover:from-[#891674] hover:to-[#671056] text-white shadow-purple-500/20",
        label: "Meesho",
      };
    }
    if (link.includes("ajio.com") || m.includes("ajio")) {
      return {
        bg: "bg-[#2C4152] text-white border-slate-400/40",
        btnBg: "bg-gradient-to-r from-[#2C4152] to-[#1C2C39] hover:from-[#1C2C39] hover:to-[#121c24] text-white shadow-slate-500/20",
        label: "Ajio",
      };
    }

    const fallbackLabel = marketplace || "Marketplace";
    return {
      bg: "bg-plum-900 text-gold-300 border-gold-400/30",
      btnBg: "bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white shadow-plum-950/20",
      label: fallbackLabel,
    };
  };

  // Prefilled Form URLs
  const getOrderFormUrl = (deal: any) => {
    return buildPrefilledOrderFormUrl(
      settings?.orderFormUrl,
      deal.productCode,
      undefined,
      settings?.orderFormProductEntryId,
      settings?.orderFormMediatorEntryId
    );
  };

  const getRefundFormUrl = (deal: any) => {
    const baseUrl = settings?.refundFormUrl || "https://forms.gle/ssWFUKVpoxoKzKWc8";
    return `${baseUrl}?usp=pp_url&entry.productName=${encodeURIComponent(deal.productName || "")}`;
  };

  const handleCopyProductCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied Deal Code: #${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtering
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const q = search.toLowerCase();
      const matchesSearch =
        deal.productName?.toLowerCase().includes(q) ||
        deal.brandName?.toLowerCase().includes(q) ||
        deal.productCode?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (marketplaceFilter !== "ALL") {
        if (!deal.marketplace?.toLowerCase().includes(marketplaceFilter.toLowerCase())) {
          return false;
        }
      }

      if (pricingFilter !== "ALL") {
        if (deal.pricingType !== pricingFilter) return false;
      }

      return true;
    });
  }, [deals, search, marketplaceFilter, pricingFilter]);

  // Paginated Slice
  const totalEntries = filteredDeals.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner with 3D Interactive Three.js Lotus Gem */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <ThreeEmblem size={72} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              <Sparkles className="w-3 h-3 text-gold-400" />
              Verified Review & Rebate Hub
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black mt-1.5 text-white tracking-tight">
              Active Deals & Cashback Campaigns
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
              Explore 100% full refund and discount deals verified by administration. Order on marketplace, fill the form, and claim your refund after review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <a
            href={settings?.orderFormUrl || "https://forms.gle/ydedLFJwcef59hPD7"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 text-xs font-black shadow-lg shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-plum-900" />
            General Order Form
          </a>
        </div>
      </div>

      {/* 3-Step Buyer Action Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-plum-100 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-black text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="font-bold text-xs text-plum-950">Purchase Product</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Click &quot;Buy Product&quot; to open the listing on Amazon, Flipkart, or Myntra and place your order.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-plum-100 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-lotus-100 text-lotus-800 flex items-center justify-center font-black text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="font-bold text-xs text-plum-950">Fill Google Order Form</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Submit your Order ID, purchase screenshot, and details into the prefilled Google Order Form.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-plum-100 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
            3
          </div>
          <div>
            <h4 className="font-bold text-xs text-plum-950">Review & Claim Refund</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              After delivery, submit your review on the marketplace and fill the Google Refund Form for payout.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-plum-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by product, brand, or code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 bg-[#FAF5F8]/60"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Marketplace Selector */}
          <div className="flex items-center gap-1.5 bg-[#FAF5F8] p-1 rounded-2xl border border-plum-100">
            {["ALL", "Amazon", "Flipkart", "Myntra"].map((mkt) => (
              <button
                key={mkt}
                onClick={() => setMarketplaceFilter(mkt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  marketplaceFilter === mkt
                    ? "bg-plum-900 text-white shadow-xs"
                    : "text-plum-800 hover:bg-plum-100/60"
                }`}
              >
                {mkt === "ALL" ? "All Platforms" : mkt}
              </button>
            ))}
          </div>

          {/* Custom Luxury Pricing Model Selector */}
          <CustomDropdown
            value={pricingFilter}
            onChange={(val) => setPricingFilter(val)}
            options={[
              { value: "ALL", label: "All Offer Types" },
              { value: "FULL_REFUND", label: "100% Full Refund" },
              { value: "LESS", label: "Less / Deduction" },
              { value: "COMMISSION", label: "Commission Bonus" },
            ]}
            className="w-48"
            size="sm"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#FAF5F8] p-1 rounded-xl border border-plum-100">
            <button
              onClick={() => setViewMode("column")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "column" ? "bg-plum-900 text-white shadow-xs" : "text-gray-400 hover:text-plum-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("row")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "row" ? "bg-plum-900 text-white shadow-xs" : "text-gray-400 hover:text-plum-900"
              }`}
              title="Row View"
            >
              <Rows className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Listing */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-plum-200 border-t-plum-800 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading active buyer deals...</p>
        </div>
      ) : paginatedDeals.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-plum-100 p-8">
          <Tag className="w-12 h-12 text-plum-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-plum-950 text-base">No Matching Deals Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or marketplace filters to discover active campaigns.
          </p>
        </div>
      ) : viewMode === "column" ? (
        /* GRID / COLUMN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedDeals.map((deal) => {
            const mkt = getMarketplaceInfo(deal.marketplace, deal.productLink);
            const dealTypeBadge = getDealTypeBadge(deal.dealType);
            const isFull = (deal.remainingSlots ?? 0) <= 0;
            const ratingTotal = deal.ratingSlots || 1;
            const ratingRem = deal.remainingRating ?? 0;
            const ratingPercent = Math.min(100, Math.max(0, (ratingRem / ratingTotal) * 100));

            const reviewTotal = deal.reviewSlots || 1;
            const reviewRem = deal.remainingReview ?? 0;
            const reviewPercent = Math.min(100, Math.max(0, (reviewRem / reviewTotal) * 100));

            const orderOnlyTotal = deal.orderOnlySlots || 0;
            const orderOnlyRem = deal.remainingOrderOnly ?? 0;
            const orderOnlyPercent = orderOnlyTotal > 0 ? Math.min(100, Math.max(0, (orderOnlyRem / orderOnlyTotal) * 100)) : 0;

            const isNoInvestment = deal.dealType === "No Investment" || deal.dealType === "No Investment Deal";
            const rawAdminPhone = (deal.whatsappNumber || "9876543210").replace(/\D/g, "");
            const adminPhone = rawAdminPhone.length === 10 ? "91" + rawAdminPhone : rawAdminPhone;
            const whatsappPreMsg =
              deal.whatsappMessage ||
              "Hey, I want to take the No Investment Deal. Please share details!";
            const takeDealUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappPreMsg)}`;

            return (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-plum-100 shadow-sm hover:shadow-xl hover:border-gold-300/80 transition-all flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Image & Badges */}
                <div>
                  <div
                    onClick={() => setLightboxDeal(deal)}
                    title="Click to view full image"
                    className="relative aspect-[4/3] bg-gradient-to-br from-plum-50/50 to-white overflow-hidden p-4 border-b border-gray-100 cursor-zoom-in"
                  >
                    <SafeImage
                      src={deal.productImage}
                      alt={deal.productName}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Marketplace Tag & Deal Type */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[65%]">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase shadow-xs ${mkt.bg}`}>
                        {mkt.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border shadow-xs ${dealTypeBadge.bg}`}>
                        {dealTypeBadge.label}
                      </span>
                    </div>

                    {/* Offer Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                        {deal.pricingType === "LESS"
                          ? `Less ₹${deal.lessAmount}`
                          : deal.pricingType === "COMMISSION"
                          ? `+₹${deal.commissionAmount}`
                          : "100% Refund"}
                      </span>
                    </div>

                    {/* Deal Code Copyable Pill */}
                    <div className="absolute bottom-3 left-3">
                      <button
                        onClick={() => handleCopyProductCode(deal.productCode)}
                        className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px] flex items-center gap-1 hover:bg-black/80 transition-colors"
                        title="Click to copy Deal Code"
                      >
                        {copiedCode === deal.productCode ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-gray-300" />
                        )}
                        #{deal.productCode}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          {deal.brandName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${dealTypeBadge.bg}`}>
                            {dealTypeBadge.label}
                          </span>
                          {!isNoInvestment && <AnimatedInfoButton onClick={() => setInfoModalDeal(deal)} />}
                        </div>
                      </div>
                      <h3 className="font-bold text-plum-950 text-sm leading-snug line-clamp-2 mt-0.5 group-hover:text-lotus-700 transition-colors">
                        {deal.productName}
                      </h3>
                    </div>

                    {deal.description && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 font-black text-[10px] text-emerald-800 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Special Deal Details
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-emerald-900 whitespace-pre-line">
                          {deal.description}
                        </p>
                      </div>
                    )}

                    {/* Pricing & Slots Meter - Hidden for No Investment Deal */}
                    {!isNoInvestment && (
                      <>
                        <div className="p-2.5 rounded-2xl bg-[#FAF5F8] border border-plum-100/70 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">Deal Price</span>
                            <span className="text-base font-black text-plum-950">₹{deal.price}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">Your Cashback</span>
                            <span className="text-base font-black text-emerald-700">
                              {deal.pricingType === "LESS"
                                ? `-₹${deal.lessAmount || 0}`
                                : deal.pricingType === "COMMISSION"
                                ? `+₹${deal.commissionAmount || 0}`
                                : `₹${deal.price}`}
                            </span>
                          </div>
                        </div>

                        {/* Granular Feedback Slots Meter */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {/* Rating Slots */}
                          <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700 flex items-center gap-1">
                                <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                                Rating
                              </span>
                              <span className="font-mono font-black text-gold-800">{ratingRem}/{ratingTotal}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-gold-400 to-amber-500" style={{ width: `${ratingPercent}%` }} />
                            </div>
                            <span className="text-[9px] text-amber-800 font-bold mt-1 block truncate">
                              {formatPricingLabel(
                                deal.ratingPricingType || deal.pricingType,
                                deal.ratingLessAmount ?? deal.lessAmount,
                                deal.ratingCommissionAmount ?? deal.commissionAmount
                              )}
                            </span>
                          </div>

                          {/* Review Slots */}
                          <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-lotus-500" />
                                Review
                              </span>
                              <span className="font-mono font-black text-lotus-800">{reviewRem}/{reviewTotal}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-lotus-500 to-pink-500" style={{ width: `${reviewPercent}%` }} />
                            </div>
                            <span className="text-[9px] text-lotus-800 font-bold mt-1 block truncate">
                              {formatPricingLabel(
                                deal.reviewPricingType || deal.pricingType,
                                deal.reviewLessAmount ?? deal.lessAmount,
                                deal.reviewCommissionAmount ?? deal.commissionAmount
                              )}
                            </span>
                          </div>

                          {/* Order Only Slots */}
                          {orderOnlyTotal > 0 && (
                            <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-200/70 col-span-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-indigo-950 flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3 text-indigo-600" />
                                  Order Only
                                </span>
                                <span className="font-mono font-black text-indigo-800">{orderOnlyRem}/{orderOnlyTotal}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-plum-600" style={{ width: `${orderOnlyPercent}%` }} />
                              </div>
                              <span className="text-[9px] text-indigo-800 font-bold mt-1 block truncate">
                                {formatPricingLabel(
                                  deal.orderOnlyPricingType || deal.pricingType,
                                  deal.orderOnlyLessAmount ?? deal.lessAmount,
                                  deal.orderOnlyCommissionAmount ?? deal.commissionAmount
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct Buyer Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  {isNoInvestment ? (
                    isFull ? (
                      <button
                        disabled
                        className="w-full py-3 px-3 rounded-xl font-bold text-xs bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        Slots Closed (Completed)
                      </button>
                    ) : (
                      <a
                        href={takeDealUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-center"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-200" />
                        Take Deal (WhatsApp) →
                      </a>
                    )
                  ) : (
                    <>
                      {/* Buy on Marketplace Product Link */}
                      {isFull ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-gray-200 text-gray-500 cursor-not-allowed shadow-none flex items-center justify-center gap-1.5"
                        >
                          Offer Closed (Slots Completed)
                        </button>
                      ) : deal.productLink ? (
                        <a
                          href={deal.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 ${mkt.btnBg}`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-gold-300" />
                          Buy on {mkt.label} →
                        </a>
                      ) : (
                        <div className="text-center py-2 text-[10px] text-gray-400 italic">
                          Direct product link available via mediator pitch
                        </div>
                      )}

                      {/* Order Form & Refund Form Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {isFull ? (
                          <button
                            disabled
                            className="py-2 px-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-not-allowed shadow-none"
                            title="Deal slots completed. Form closed."
                          >
                            Slots Closed
                          </button>
                        ) : (
                          <a
                            href={getOrderFormUrl(deal)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2.5 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                            title="Fill Google Order Form for this deal"
                          >
                            <ExternalLink className="w-3 h-3 text-plum-600" />
                            Order Form
                          </a>
                        )}

                        <a
                          href={getRefundFormUrl(deal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl border border-lotus-200 bg-lotus-50/50 hover:bg-lotus-100/70 text-lotus-800 text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                          title="Fill Google Refund Form for this deal"
                        >
                          <RotateCcw className="w-3 h-3 text-lotus-600" />
                          Refund Form
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ROW / LIST VIEW */
        <div className="space-y-4">
          {paginatedDeals.map((deal) => {
            const mkt = getMarketplaceInfo(deal.marketplace, deal.productLink);
            const dealTypeBadge = getDealTypeBadge(deal.dealType);
            const isFull = (deal.remainingSlots ?? 0) <= 0;
            const ratingTotal = deal.ratingSlots || 1;
            const ratingRem = deal.remainingRating ?? 0;
            const reviewTotal = deal.reviewSlots || 1;
            const reviewRem = deal.remainingReview ?? 0;
            const orderOnlyTotal = deal.orderOnlySlots || 0;
            const orderOnlyRem = deal.remainingOrderOnly ?? 0;

            const isNoInvestment = deal.dealType === "No Investment" || deal.dealType === "No Investment Deal";
            const rawAdminPhone = (deal.whatsappNumber || "9876543210").replace(/\D/g, "");
            const adminPhone = rawAdminPhone.length === 10 ? "91" + rawAdminPhone : rawAdminPhone;
            const whatsappPreMsg =
              deal.whatsappMessage ||
              "Hey, I want to take the No Investment Deal. Please share details!";
            const takeDealUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappPreMsg)}`;

            return (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-plum-100 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div
                    onClick={() => setLightboxDeal(deal)}
                    title="Click to view full image"
                    className="w-20 h-20 relative bg-plum-50/50 rounded-2xl overflow-hidden shrink-0 border border-plum-100 cursor-zoom-in hover:ring-2 hover:ring-plum-400 transition-all"
                  >
                    <SafeImage src={deal.productImage} alt={deal.productName} fill className="object-contain p-2" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase ${mkt.bg}`}>
                        {mkt.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${dealTypeBadge.bg}`}>
                        {dealTypeBadge.label}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">#{deal.productCode}</span>
                      {!isNoInvestment && <AnimatedInfoButton onClick={() => setInfoModalDeal(deal)} />}
                    </div>
                    <h3 className="font-bold text-plum-950 text-sm sm:text-base mt-1 line-clamp-1 group-hover:text-lotus-700 transition-colors">
                      {deal.productName}
                    </h3>
                    {!isNoInvestment && (
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-400">Price: <strong className="text-plum-950 font-black">₹{deal.price}</strong></span>
                        <span className="text-emerald-700 font-bold">
                          Cashback: {deal.pricingType === "LESS" ? `-₹${deal.lessAmount}` : `₹${deal.price}`}
                        </span>
                      </div>
                    )}
                    {deal.description && (
                      <div className="mt-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs shadow-2xs space-y-0.5">
                        <div className="flex items-center gap-1.5 font-black text-[10px] text-emerald-800 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Special Deal Details
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-emerald-900 line-clamp-2">
                          {deal.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slots info - Hidden for No Investment Deal */}
                {!isNoInvestment && (
                  <div className="hidden lg:flex items-center gap-4 text-xs">
                    <div className="text-center p-2 rounded-xl bg-gray-50 border border-gray-100 w-28">
                      <span className="text-[10px] text-gray-400 block">Rating Slots</span>
                      <strong className="text-gold-700 font-mono block">{ratingRem}/{ratingTotal}</strong>
                      <span className="text-[9px] text-amber-800 font-bold block truncate">
                        {formatPricingLabel(
                          deal.ratingPricingType || deal.pricingType,
                          deal.ratingLessAmount ?? deal.lessAmount,
                          deal.ratingCommissionAmount ?? deal.commissionAmount
                        )}
                      </span>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-gray-50 border border-gray-100 w-28">
                      <span className="text-[10px] text-gray-400 block">Review Slots</span>
                      <strong className="text-lotus-700 font-mono block">{reviewRem}/{reviewTotal}</strong>
                      <span className="text-[9px] text-lotus-800 font-bold block truncate">
                        {formatPricingLabel(
                          deal.reviewPricingType || deal.pricingType,
                          deal.reviewLessAmount ?? deal.lessAmount,
                          deal.reviewCommissionAmount ?? deal.commissionAmount
                        )}
                      </span>
                    </div>
                    {orderOnlyTotal > 0 && (
                      <div className="text-center p-2 rounded-xl bg-indigo-50/60 border border-indigo-200/70 w-28">
                        <span className="text-[10px] text-indigo-700 block">Order Only</span>
                        <strong className="text-indigo-900 font-mono block">{orderOnlyRem}/{orderOnlyTotal}</strong>
                        <span className="text-[9px] text-indigo-800 font-bold block truncate">
                          {formatPricingLabel(
                            deal.orderOnlyPricingType || deal.pricingType,
                            deal.orderOnlyLessAmount ?? deal.lessAmount,
                            deal.orderOnlyCommissionAmount ?? deal.commissionAmount
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {isNoInvestment ? (
                    isFull ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                      >
                        Slots Closed (Completed)
                      </button>
                    ) : (
                      <a
                        href={takeDealUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-200" />
                        Take Deal (WhatsApp) →
                      </a>
                    )
                  ) : (
                    <>
                      {isFull ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl font-bold text-xs bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                        >
                          Offer Closed (Slots Completed)
                        </button>
                      ) : deal.productLink ? (
                        <a
                          href={deal.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${mkt.btnBg}`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-gold-300" />
                          Buy on {mkt.label} →
                        </a>
                      ) : null}

                      {isFull ? (
                        <button
                          disabled
                          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed"
                        >
                          Slots Closed
                        </button>
                      ) : (
                        <a
                          href={getOrderFormUrl(deal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl border border-plum-200 bg-white hover:bg-plum-50 text-plum-900 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-plum-600" />
                          Order Form
                        </a>
                      )}

                      <a
                        href={getRefundFormUrl(deal)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl border border-lotus-200 bg-lotus-50 hover:bg-lotus-100 text-lotus-800 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-lotus-600" />
                        Refund Form
                      </a>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {filteredDeals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalEntries={totalEntries}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
        />
      )}

      {/* Deal Instructions & Payment Timeline Popup */}
      <DealInfoModal
        deal={infoModalDeal}
        isOpen={!!infoModalDeal}
        onClose={() => setInfoModalDeal(null)}
      />

      {/* Full-Size Product Image Lightbox */}
      <ProductImageLightbox
        src={lightboxDeal?.productImage}
        alt={lightboxDeal?.productName || "Product"}
        brandName={lightboxDeal?.brandName}
        isOpen={!!lightboxDeal}
        onClose={() => setLightboxDeal(null)}
      />
    </div>
  );
}
