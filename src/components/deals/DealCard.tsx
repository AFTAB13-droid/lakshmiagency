"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import SafeImage from "@/components/common/SafeImage";
import {
  Tag,
  Star,
  MessageSquare,
  Megaphone,
  Copy,
  ExternalLink,
  Check,
  Share2,
  Sparkles,
  Zap,
  Pencil,
  Trash2,
  RefreshCw,
  MessageCircle,
  Info,
  Archive,
  X,
  Clock,
  FileText,
} from "lucide-react";

export const getDealTypeBadge = (dealType?: string) => {
  const type = dealType || "Original";
  if (type === "Empty Box") {
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      label: "Empty Box",
    };
  }
  if (type === "Exchange") {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Exchange",
    };
  }
  if (type === "No Investment" || type === "No Investment Deal") {
    return {
      bg: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500 font-black shadow-xs",
      label: "💎 No Investment Deal",
    };
  }
  return {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    label: "Original",
  };
};

export const formatPricingLabel = (
  pricingType?: string,
  lessAmount?: number,
  commissionAmount?: number
) => {
  if (pricingType === "LESS") return `Less ₹${lessAmount || 0}`;
  if (pricingType === "COMMISSION") return `+₹${commissionAmount || 0} Comm`;
  return "100% Full Refund";
};

export const buildPrefilledOrderFormUrl = (
  baseUrl?: string,
  productCode?: string,
  mediatorCode?: string,
  productEntryId?: string,
  mediatorEntryId?: string
) => {
  const base = baseUrl || "https://docs.google.com/forms/d/e/1FAIpQLSf2AQzFD2OvlaBKqJAD2kosppTunWbCmF7fN99dykQ65GoVVA/viewform";
  const normalizeEntry = (id?: string, fallback = "") => {
    const clean = (id || "").trim();
    if (!clean) return fallback;
    return clean.startsWith("entry.") ? clean : `entry.${clean}`;
  };
  const pKey = normalizeEntry(productEntryId, "entry.1856628188");
  const mKey = normalizeEntry(mediatorEntryId, "entry.mediator");
  const sep = base.includes("?") ? "&" : "?";
  const params = [`usp=pp_url`];
  if (productCode) params.push(`${pKey}=${encodeURIComponent(productCode)}`);
  if (mediatorCode) params.push(`${mKey}=${encodeURIComponent(mediatorCode)}`);
  return `${base}${sep}${params.join("&")}`;
};

export const AnimatedInfoButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.92 }}
    animate={{
      boxShadow: [
        "0 0 0 0 rgba(99, 102, 241, 0.45)",
        "0 0 0 7px rgba(99, 102, 241, 0)",
      ],
    }}
    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
    className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-plum-700 to-lotus-600 text-white flex items-center justify-center shadow-md border border-white/60 shrink-0 cursor-pointer"
    title="View Deal Instructions & Payment Timeline"
  >
    <Info className="w-3.5 h-3.5" />
  </motion.button>
);

export const DealInfoModal = ({
  deal,
  isOpen,
  onClose,
}: {
  deal: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !deal) return null;
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden"
        >
          <div className="p-5 bg-gradient-to-r from-plum-900 via-indigo-900 to-lotus-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Info className="w-5 h-5 text-gold-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base leading-tight line-clamp-1">
                  {deal.productName}
                </h3>
                <p className="text-[10px] text-white/75 font-mono">
                  #{deal.productCode} • {deal.brandName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-indigo-950 uppercase tracking-wider text-[11px]">
                <FileText className="w-4 h-4 text-indigo-600" />
                Deal Instructions &amp; Review Policy
              </div>
              <p className="text-indigo-950/90 leading-relaxed whitespace-pre-line font-medium">
                {deal.instructions?.trim() ||
                  "Follow standard marketplace review guidelines, keep the review live, and submit your Refund Form within the deadline."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-amber-950 uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4 text-amber-600" />
                Payment Timeline &amp; Details
              </div>
              <p className="text-amber-950/90 leading-relaxed whitespace-pre-line font-bold">
                {deal.paymentTimeline?.trim() ||
                  "20–25 working days after review goes live and Refund Form is submitted."}
              </p>
            </div>
          </div>

          <div className="p-4 pt-0 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl plum-gradient-bg text-white font-bold text-xs shadow-sm hover:opacity-95"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface DealCardProps {
  deal: any;
  mediatorCode?: string;
  orderFormUrl?: string;
  orderFormProductEntryId?: string;
  orderFormMediatorEntryId?: string;
  layout?: "column" | "row";
  onOpenMessageModal?: (deal: any) => void;
  onCopyAnnouncement?: (deal: any) => void;
  onEdit?: (deal: any) => void;
  onDelete?: (deal: any) => void;
  onRelist?: (deal: any) => void;
  onArchive?: (deal: any) => void;
  onMakeLive?: (deal: any) => void;
  isAdmin?: boolean;
}

export default function DealCard({
  deal,
  mediatorCode = "LAX096",
  orderFormUrl,
  orderFormProductEntryId,
  orderFormMediatorEntryId,
  layout = "column",
  onOpenMessageModal,
  onCopyAnnouncement,
  onEdit,
  onDelete,
  onRelist,
  onArchive,
  onMakeLive,
  isAdmin = false,
}: DealCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isFull = (deal.remainingSlots ?? 0) <= 0;

  // Build prefilled Google Form URL using real Entry IDs when configured
  const prefilledUrl = buildPrefilledOrderFormUrl(
    orderFormUrl,
    deal.productCode,
    mediatorCode,
    orderFormProductEntryId,
    orderFormMediatorEntryId
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(prefilledUrl);
    setCopiedLink(true);
    toast.success(`Copied prefilled order link for #${deal.productCode}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Marketplace badge styling
  const getMarketplaceBadge = (marketplace: string) => {
    const m = (marketplace || "").toLowerCase();
    if (m.includes("amazon")) {
      return {
        bg: "bg-[#232F3E] text-[#FF9900] border-[#FF9900]/30",
        label: "Amazon",
      };
    }
    if (m.includes("flipkart")) {
      return {
        bg: "bg-[#2874F0] text-white border-blue-400/40",
        label: "Flipkart",
      };
    }
    if (m.includes("myntra")) {
      return {
        bg: "bg-[#FF3F6C] text-white border-pink-400/40",
        label: "Myntra",
      };
    }
    return {
      bg: "bg-plum-900 text-gold-300 border-gold-400/30",
      label: marketplace || "Marketplace",
    };
  };

  const mkt = getMarketplaceBadge(deal.marketplace);
  const dealTypeBadge = getDealTypeBadge(deal.dealType);

  // Review & Rating slot percentages
  const ratingTotal = deal.ratingSlots || 1;
  const ratingRem = deal.remainingRating ?? 0;
  const ratingPercent = Math.min(100, Math.max(0, (ratingRem / ratingTotal) * 100));

  const reviewTotal = deal.reviewSlots || 1;
  const reviewRem = deal.remainingReview ?? 0;
  const reviewPercent = Math.min(100, Math.max(0, (reviewRem / reviewTotal) * 100));

  const isNoInvestment = deal.dealType === "No Investment" || deal.dealType === "No Investment Deal";
  const rawAdminPhone = (deal.whatsappNumber || "9876543210").replace(/\D/g, "");
  const adminPhone = rawAdminPhone.length === 10 ? "91" + rawAdminPhone : rawAdminPhone;
  const whatsappPreMsg =
    deal.whatsappMessage ||
    `Hey, I want to take the No Investment Deal. Please share details!`;
  const takeDealUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappPreMsg)}`;

  // =========================================================================
  // ROW VIEW (HORIZONTAL WIDE LUXURY CARD)
  // =========================================================================
  if (layout === "row") {
    return (
      <>
        <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -4, scale: 1.008 }}
        className={`group relative flex flex-col md:flex-row bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-plum-950/10 ${
          isFull
            ? "border-gray-200/80 opacity-75"
            : "border-plum-100/90 hover:border-gold-400/80"
        }`}
      >
        {/* Top Ambient Gold Highlight Bar on Hover */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-plum-600 via-lotus-500 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Product Image on Left */}
        <div className="relative w-full md:w-72 lg:w-80 h-56 md:h-auto min-h-[220px] bg-gradient-to-br from-plum-50 via-lotus-50/40 to-gold-50/30 overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-plum-100/60">
          <SafeImage
            src={deal.productImage}
            alt={deal.productName}
            fill
            className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            fallbackText={deal.brandName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md border ${mkt.bg}`}
              >
                {mkt.label}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md border ${dealTypeBadge.bg}`}
              >
                {dealTypeBadge.label}
              </span>
            </div>

            {deal.pricingType === "LESS" ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-amber-300/40 flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold-200" />
                Less ₹{deal.lessAmount}
              </span>
            ) : deal.pricingType === "COMMISSION" ? (
              <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-emerald-300/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-200" />
                +₹{deal.commissionAmount} Comm
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-blue-300/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-200" />
                100% Full Refund
              </span>
            )}
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
            <span className="px-3 py-1 rounded-xl bg-plum-950/80 backdrop-blur-md text-gold-300 text-[11px] font-black uppercase tracking-widest border border-gold-400/30 shadow-md">
              {deal.brandName}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                isFull
                  ? "bg-red-950/85 text-red-200 border border-red-500/40"
                  : "bg-emerald-950/85 text-emerald-200 border border-emerald-400/40"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFull ? "bg-red-400" : "bg-emerald-400 animate-pulse"
                }`}
              />
              {isFull
                ? "Slots Full"
                : `${deal.remainingSlots} / ${deal.totalSlots} Slots`}
            </span>
          </div>
        </div>

        {/* Content & Actions Area (Flex-1) */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 gap-4">
          {/* Top Title & Pricing */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-gray-400 tracking-wider">
                  #{deal.productCode}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${dealTypeBadge.bg}`}>
                  {dealTypeBadge.label}
                </span>
                {!isNoInvestment && <AnimatedInfoButton onClick={() => setShowInfoModal(true)} />}
              </div>

              {/* Price Strip - Hidden for No Investment Deal */}
              {!isNoInvestment && (
                <div className="flex items-center gap-4 bg-plum-50/60 px-3.5 py-1.5 rounded-2xl border border-plum-100">
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                      Product Price
                    </span>
                    <span className="text-sm sm:text-base font-black text-plum-950">
                      ₹{deal.price}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-plum-200" />
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                      {deal.pricingType === "LESS"
                        ? "Deduction"
                        : deal.pricingType === "COMMISSION"
                        ? "Mediator Comm"
                        : "Cashback"}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      {deal.pricingType === "LESS"
                        ? `-₹${deal.lessAmount || 0}`
                        : deal.pricingType === "COMMISSION"
                        ? `+₹${deal.commissionAmount || 0}`
                        : "₹" + deal.price}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-bold text-plum-950 text-base sm:text-lg mt-2 group-hover:text-lotus-700 transition-colors leading-snug">
              {deal.productName}
            </h3>

            {deal.description && (
              <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-[10px] text-emerald-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Special Deal Details
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-emerald-900 whitespace-pre-line">
                  {deal.description}
                </p>
              </div>
            )}
          </div>

          {/* Granular Feedback Slots Meter - Hidden for No Investment Deal */}
          {!isNoInvestment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rating Slot Meter */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5F8] border border-plum-100/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                    Rating Slots
                  </span>
                  <span className="text-xs font-mono font-black text-gold-800">
                    {ratingRem} / {ratingTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200/80 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratingPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-gold-400 to-amber-500 rounded-full"
                  />
                </div>
                <span className="text-[10px] text-amber-800 font-bold mt-1.5 block">
                  {formatPricingLabel(
                    deal.ratingPricingType || deal.pricingType,
                    deal.ratingLessAmount ?? deal.lessAmount,
                    deal.ratingCommissionAmount ?? deal.commissionAmount
                  )}
                </span>
              </div>

              {/* Review Slot Meter */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5F8] border border-plum-100/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-lotus-500" />
                    Review Slots
                  </span>
                  <span className="text-xs font-mono font-black text-lotus-800">
                    {reviewRem} / {reviewTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200/80 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reviewPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-lotus-500 to-pink-500 rounded-full"
                  />
                </div>
                <span className="text-[10px] text-lotus-800 font-bold mt-1.5 block">
                  {formatPricingLabel(
                    deal.reviewPricingType || deal.pricingType,
                    deal.reviewLessAmount ?? deal.lessAmount,
                    deal.reviewCommissionAmount ?? deal.commissionAmount
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons Hub */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {isNoInvestment ? (
              <div className="flex items-center gap-2">
                {isFull ? (
                  <button
                    disabled
                    className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gray-200 text-gray-500 cursor-not-allowed"
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
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  disabled={isFull}
                  className="py-2 px-3 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-40"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-plum-600" />
                      Copy Form Link
                    </>
                  )}
                </button>

                {isFull ? (
                  <button
                    disabled
                    className="py-2 px-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-not-allowed shadow-none"
                    title="Slots completed. Form is closed."
                  >
                    Slots Closed
                  </button>
                ) : (
                  <a
                    href={prefilledUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-plum-600" />
                    Open Form
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {onMakeLive && deal.isActive === false && !isFull && (
                <button
                  onClick={() => onMakeLive(deal)}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-gold-300" />
                  Make Live
                </button>
              )}

              {onArchive && deal.isActive !== false && !isFull && (
                <button
                  onClick={() => onArchive(deal)}
                  className="py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-200 shadow-2xs active:scale-95"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                  Hold / Archive
                </button>
              )}

              {onRelist && isFull && (
                <button
                  onClick={() => onRelist(deal)}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
                  Relist Deal
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => onEdit(deal)}
                  className="py-2 px-3.5 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5 border border-plum-200 shadow-2xs hover:border-plum-300 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5 text-plum-700" />
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(deal)}
                  className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200 shadow-2xs hover:border-red-300 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  Delete
                </button>
              )}

              {onOpenMessageModal && (
                <button
                  onClick={() => onOpenMessageModal(deal)}
                  disabled={isFull}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                  Order Message
                </button>
              )}

              {onCopyAnnouncement && (
                <button
                  onClick={() => onCopyAnnouncement(deal)}
                  disabled={isFull}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-plum-950 font-black text-xs shadow-md shadow-gold-600/20 hover:from-gold-400 hover:to-amber-500 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Megaphone className="w-3.5 h-3.5 text-plum-900" />
                  Announcement
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <DealInfoModal deal={deal} isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
      </>
    );
  }

  // =========================================================================
  // COLUMN VIEW (VERTICAL GRID CARD - DEFAULT)
  // =========================================================================
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.015 }}
      className={`group relative flex flex-col justify-between bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-plum-950/10 ${
        isFull
          ? "border-gray-200/80 opacity-75"
          : "border-plum-100/90 hover:border-gold-400/80"
      }`}
    >
      {/* Top Ambient Gold Highlight Bar on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-plum-600 via-lotus-500 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      <div>
        {/* Big Product Image Section */}
        <div className="relative h-52 w-full bg-gradient-to-br from-plum-50 via-lotus-50/40 to-gold-50/30 overflow-hidden border-b border-plum-100/60">
          <SafeImage
            src={deal.productImage}
            alt={deal.productName}
            fill
            className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            fallbackText={deal.brandName}
          />

          {/* Dark gradient overlay for badge readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {/* Marketplace Badge & Deal Type */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md border ${mkt.bg}`}
              >
                {mkt.label}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md border ${dealTypeBadge.bg}`}
              >
                {dealTypeBadge.label}
              </span>
            </div>

            {/* Pricing Model Pill */}
            {deal.pricingType === "LESS" ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-amber-300/40 flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold-200" />
                Less ₹{deal.lessAmount}
              </span>
            ) : deal.pricingType === "COMMISSION" ? (
              <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-emerald-300/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-200" />
                +₹{deal.commissionAmount} Comm
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide shadow-md border border-blue-300/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-200" />
                100% Full Refund
              </span>
            )}
          </div>

          {/* Bottom Image Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
            {/* Brand Pill */}
            {!isNoInvestment ? (
              <span className="px-3 py-1 rounded-xl bg-plum-950/80 backdrop-blur-md text-gold-300 text-[11px] font-black uppercase tracking-widest border border-gold-400/30 shadow-md">
                {deal.brandName}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-400/40 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Zero Investment
              </span>
            )}

            {/* Slots Status Pill */}
            {!isNoInvestment && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                  isFull
                    ? "bg-red-950/85 text-red-200 border border-red-500/40"
                    : "bg-emerald-950/85 text-emerald-200 border border-emerald-400/40"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFull ? "bg-red-400" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {isFull
                  ? "Slots Full"
                  : `${deal.remainingSlots} / ${deal.totalSlots} Slots`}
              </span>
            )}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-4">
          {/* Product Title and Code */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-gray-400 tracking-wider">
                #{deal.productCode}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${dealTypeBadge.bg}`}>
                  {dealTypeBadge.label}
                </span>
                {!isNoInvestment && <AnimatedInfoButton onClick={() => setShowInfoModal(true)} />}
              </div>
            </div>
            <h3 className="font-bold text-plum-950 text-sm mt-1 line-clamp-2 leading-snug group-hover:text-lotus-700 transition-colors">
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

          {/* Pricing Highlight Strip & Slots Meters - Hidden for No Investment Deals */}
          {!isNoInvestment && (
            <>
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-plum-50/70 via-lotus-50/40 to-gold-50/30 border border-plum-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                    Product Price
                  </span>
                  <span className="text-lg font-black text-plum-950">₹{deal.price}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                    {deal.pricingType === "LESS"
                      ? "Deduction"
                      : deal.pricingType === "COMMISSION"
                      ? "Mediator Comm"
                      : "Cashback"}
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {deal.pricingType === "LESS"
                      ? `-₹${deal.lessAmount || 0}`
                      : deal.pricingType === "COMMISSION"
                      ? `+₹${deal.commissionAmount || 0}`
                      : "₹" + deal.price}
                  </span>
                </div>
              </div>

              {/* Granular Slots Progress Meters */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Rating Slot Meter */}
                <div className="p-3 rounded-2xl bg-[#FAF5F8] border border-plum-100/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                      Rating
                    </span>
                    <span className="text-[10px] font-mono font-black text-gold-800">
                      {ratingRem}/{ratingTotal}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200/80 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratingPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-gold-400 to-amber-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold mt-1.5 block truncate">
                    {formatPricingLabel(
                      deal.ratingPricingType || deal.pricingType,
                      deal.ratingLessAmount ?? deal.lessAmount,
                      deal.ratingCommissionAmount ?? deal.commissionAmount
                    )}
                  </span>
                </div>

                {/* Review Slot Meter */}
                <div className="p-3 rounded-2xl bg-[#FAF5F8] border border-plum-100/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-lotus-500" />
                      Review
                    </span>
                    <span className="text-[10px] font-mono font-black text-lotus-800">
                      {reviewRem}/{reviewTotal}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200/80 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${reviewPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-lotus-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-lotus-800 font-bold mt-1.5 block truncate">
                    {formatPricingLabel(
                      deal.reviewPricingType || deal.pricingType,
                      deal.reviewLessAmount ?? deal.lessAmount,
                      deal.reviewCommissionAmount ?? deal.commissionAmount
                    )}
                  </span>
                </div>
              </div>

            </>
          )}
        </div>
      </div>

      {/* Action Buttons Hub matching ZMA */}
      <div className="p-4 pt-0 space-y-2.5">
        {/* Admin Quick Action Controls */}
        {(onEdit || onDelete || onRelist || onArchive || onMakeLive) && (
          <div className="space-y-2">
            {onMakeLive && deal.isActive === false && !isFull && (
              <button
                onClick={() => onMakeLive(deal)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-gold-300" />
                Make Live Directly
              </button>
            )}

            {onArchive && deal.isActive !== false && !isFull && (
              <button
                onClick={() => onArchive(deal)}
                className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" />
                Hold / Archive Deal
              </button>
            )}

            {onRelist && (isFull || deal.isActive === false) && (
              <button
                onClick={() => onRelist(deal)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
                Relist / Add Custom Stock
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(deal)}
                  className="py-2.5 px-3 rounded-xl bg-plum-50 hover:bg-plum-100 text-plum-900 font-bold text-xs border border-plum-200/90 shadow-2xs hover:border-plum-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5 text-plum-700" />
                  Edit Deal
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(deal)}
                  className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200/90 shadow-2xs hover:border-red-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Special No Investment Action vs Standard Actions */}
        {isNoInvestment ? (
          <div className="space-y-2">
            {isFull ? (
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
            )}
          </div>
        ) : (
          <>
            {/* WhatsApp Pitch Generators */}
            {(onOpenMessageModal || onCopyAnnouncement) && (
              <div className="grid grid-cols-2 gap-2">
                {onOpenMessageModal && (
                  <button
                    onClick={() => onOpenMessageModal(deal)}
                    disabled={isFull}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                    Order Message
                  </button>
                )}

                {onCopyAnnouncement && (
                  <button
                    onClick={() => onCopyAnnouncement(deal)}
                    disabled={isFull}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-plum-950 font-black text-xs shadow-md shadow-gold-600/20 hover:from-gold-400 hover:to-amber-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-plum-900" />
                    Announcement
                  </button>
                )}
              </div>
            )}

            {/* Quick Link Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                disabled={isFull}
                className="py-2 px-2.5 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-plum-600" />
                    Copy Form Link
                  </>
                )}
              </button>

              {isFull ? (
                <button
                  disabled
                  className="py-2 px-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-not-allowed shadow-none"
                  title="All slots completed. Form submissions are closed."
                >
                  Slots Closed
                </button>
              ) : (
                <a
                  href={prefilledUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-plum-600" />
                  Open Form
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
    <DealInfoModal deal={deal} isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
}
