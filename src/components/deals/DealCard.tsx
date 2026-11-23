"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

interface DealCardProps {
  deal: any;
  mediatorCode?: string;
  orderFormUrl?: string;
  layout?: "column" | "row";
  onOpenMessageModal?: (deal: any) => void;
  onCopyAnnouncement?: (deal: any) => void;
}

export default function DealCard({
  deal,
  mediatorCode = "LAX096",
  orderFormUrl,
  layout = "column",
  onOpenMessageModal,
  onCopyAnnouncement,
}: DealCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const isFull = (deal.remainingSlots ?? 0) <= 0;

  // Build prefilled Google Form URL
  const baseForm = orderFormUrl || "https://forms.gle/ydedLFJwcef59hPD7";
  const prefilledUrl = `${baseForm}?usp=pp_url&entry.product=${encodeURIComponent(
    deal.productCode || ""
  )}&entry.mediator=${encodeURIComponent(mediatorCode)}`;

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

  // Review & Rating slot percentages
  const ratingTotal = deal.ratingSlots || 1;
  const ratingRem = deal.remainingRating ?? 0;
  const ratingPercent = Math.min(100, Math.max(0, (ratingRem / ratingTotal) * 100));

  const reviewTotal = deal.reviewSlots || 1;
  const reviewRem = deal.remainingReview ?? 0;
  const reviewPercent = Math.min(100, Math.max(0, (reviewRem / reviewTotal) * 100));

  // =========================================================================
  // ROW VIEW (HORIZONTAL WIDE LUXURY CARD)
  // =========================================================================
  if (layout === "row") {
    return (
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
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md border ${mkt.bg}`}
            >
              {mkt.label}
            </span>

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
                {deal.dealType && (
                  <span className="text-[10px] font-bold text-plum-700 bg-plum-50 px-2.5 py-0.5 rounded-md border border-plum-100">
                    {deal.dealType}
                  </span>
                )}
              </div>

              {/* Price Strip */}
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
            </div>

            <h3 className="font-bold text-plum-950 text-base sm:text-lg mt-2 group-hover:text-lotus-700 transition-colors leading-snug">
              {deal.productName}
            </h3>
          </div>

          {/* Granular Feedback Slots Meter */}
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
              <span className="text-[10px] text-gray-500 font-medium mt-1.5 block">
                {deal.pricingType === "LESS" ? `Less: ₹${deal.lessAmount}` : "5★ Rating"}
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
              <span className="text-[10px] text-gray-500 font-medium mt-1.5 block">
                {deal.commissionAmount > 0
                  ? `Comm: ₹${deal.commissionAmount}`
                  : "Detailed Pic Review"}
              </span>
            </div>
          </div>

          {/* Action Buttons Hub */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
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

              <a
                href={prefilledUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-plum-600" />
                Open Form
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenMessageModal && onOpenMessageModal(deal)}
                disabled={isFull}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                Order Message
              </button>

              <button
                onClick={() => onCopyAnnouncement && onCopyAnnouncement(deal)}
                disabled={isFull}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-plum-950 font-black text-xs shadow-md shadow-gold-600/20 hover:from-gold-400 hover:to-amber-500 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Megaphone className="w-3.5 h-3.5 text-plum-900" />
                Announcement
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // COLUMN VIEW (VERTICAL GRID CARD - DEFAULT)
  // =========================================================================
  return (
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
            {/* Marketplace Badge */}
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md border ${mkt.bg}`}
            >
              {mkt.label}
            </span>

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
            <span className="px-3 py-1 rounded-xl bg-plum-950/80 backdrop-blur-md text-gold-300 text-[11px] font-black uppercase tracking-widest border border-gold-400/30 shadow-md">
              {deal.brandName}
            </span>

            {/* Slots Status Pill */}
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

        {/* Card Content Body */}
        <div className="p-5 space-y-4">
          {/* Product Title and Code */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold text-gray-400 tracking-wider">
                #{deal.productCode}
              </span>
              {deal.dealType && (
                <span className="text-[10px] font-bold text-plum-700 bg-plum-50 px-2 py-0.5 rounded-md">
                  {deal.dealType}
                </span>
              )}
            </div>
            <h3 className="font-bold text-plum-950 text-sm mt-1 line-clamp-2 leading-snug group-hover:text-lotus-700 transition-colors">
              {deal.productName}
            </h3>
          </div>

          {/* Pricing Highlight Strip */}
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
              <span className="text-[9px] text-gray-500 font-medium mt-1.5 block">
                {deal.pricingType === "LESS" ? `Less: ₹${deal.lessAmount}` : "5★ Rating"}
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
              <span className="text-[9px] text-gray-500 font-medium mt-1.5 block">
                {deal.commissionAmount > 0
                  ? `Comm: ₹${deal.commissionAmount}`
                  : "Detailed Review"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Hub matching ZMA */}
      <div className="p-4 pt-0 space-y-2.5">
        {/* WhatsApp Pitch Generators */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenMessageModal && onOpenMessageModal(deal)}
            disabled={isFull}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            Order Message
          </button>

          <button
            onClick={() => onCopyAnnouncement && onCopyAnnouncement(deal)}
            disabled={isFull}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-plum-950 font-black text-xs shadow-md shadow-gold-600/20 hover:from-gold-400 hover:to-amber-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Megaphone className="w-3.5 h-3.5 text-plum-900" />
            Announcement
          </button>
        </div>

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

          <a
            href={prefilledUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl border border-plum-200 bg-white hover:bg-plum-50/70 text-plum-900 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-plum-600" />
            Open Form
          </a>
        </div>
      </div>
    </motion.div>
  );
}
