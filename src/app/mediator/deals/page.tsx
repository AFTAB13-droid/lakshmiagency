"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DealCard, { buildPrefilledOrderFormUrl } from "@/components/deals/DealCard";
import Pagination from "@/components/common/Pagination";
import {
  Tag,
  Search,
  MessageSquare,
  Megaphone,
  Copy,
  ExternalLink,
  Check,
  X,
  Loader2,
  Sparkles,
  Filter,
  Flame,
  Share2,
  LayoutGrid,
  Rows,
} from "lucide-react";

export default function MediatorDealsPage() {
  const { data: session } = useSession();
  const [deals, setDeals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [pricingFilter, setPricingFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"column" | "row">("column");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for "Order Message"
  const [activeMessageDeal, setActiveMessageDeal] = useState<any>(null);
  const [generatedPitch, setGeneratedPitch] = useState("");
  const [copied, setCopied] = useState(false);

  // Modal State for "Announcement Broadcast"
  const [activeAnnouncementDeal, setActiveAnnouncementDeal] = useState<any>(null);
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState("");
  const [announcementCopied, setAnnouncementCopied] = useState(false);

  // @ts-ignore
  const mediatorCode = session?.user?.mediatorCode || "LAX096";

  useEffect(() => {
    fetch("/api/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDeals(data.deals || []);
          if (data.setting) setSettings(data.setting);
        }
      })
      .catch((err) => console.error("Failed to load deals:", err))
      .finally(() => setLoading(false));
  }, []);

  // Reset to first page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, platformFilter, pricingFilter]);

  const getPrefilledOrderFormUrl = (productCode: string) => {
    return buildPrefilledOrderFormUrl(
      settings?.orderFormUrl,
      productCode,
      mediatorCode,
      settings?.orderFormProductEntryId,
      settings?.orderFormMediatorEntryId
    );
  };

  const handleOpenOrderMessage = (deal: any) => {
    const formUrl = getPrefilledOrderFormUrl(deal.productCode);
    let template =
      settings?.whatsappOrderTemplate ||
      `🔥 *NEW DEAL ALERT - {brandName}* 🔥\n\n📦 *Product:* {productName}\n🛒 *Platform:* {marketplace}\n🏷️ *Deal Type:* {dealType}\n💰 *Price:* ₹{price}\n🏷️ *Offer Model:* {offerModel}\n⚡ *Slots Left:* {remainingSlots}\n\n👉 *Fill Google Order Form (Instant Booking):*\n{orderFormUrl}\n\n_Agent Code: ${mediatorCode}_`;

    const offerModel =
      deal.pricingType === "LESS"
        ? `Less ₹${deal.lessAmount}`
        : deal.pricingType === "COMMISSION"
        ? `+₹${deal.commissionAmount} Commission`
        : "100% Full Refund";

    template = template
      .replace(/{brandName}/g, deal.brandName)
      .replace(/{productName}/g, deal.productName)
      .replace(/{marketplace}/g, deal.marketplace)
      .replace(/{dealType}/g, deal.dealType || "Original")
      .replace(/{price}/g, deal.price)
      .replace(/{offerModel}/g, offerModel)
      .replace(/{lessAmount}/g, deal.lessAmount || 0)
      .replace(/{commission}/g, deal.commissionAmount || 0)
      .replace(/{remainingSlots}/g, deal.remainingSlots)
      .replace(/{orderFormUrl}/g, formUrl)
      .replace(/{instructions}/g, deal.instructions || "")
      .replace(/{paymentTimeline}/g, deal.paymentTimeline || "");

    const extraLines: string[] = [];
    if (deal.instructions?.trim() && !template.includes(deal.instructions.trim())) {
      extraLines.push(`📋 *Instructions:* ${deal.instructions.trim()}`);
    }
    if (deal.paymentTimeline?.trim() && !template.includes(deal.paymentTimeline.trim())) {
      extraLines.push(`⏱️ *Payment Timeline:* ${deal.paymentTimeline.trim()}`);
    }
    if (extraLines.length > 0) {
      template += `\n\n${extraLines.join("\n")}`;
    }

    setGeneratedPitch(template);
    setActiveMessageDeal(deal);
  };

  const handleOpenAnnouncement = (deal: any) => {
    let template =
      settings?.whatsappAnnouncementTemplate ||
      `✨ *EXCLUSIVE VIP DEAL BROADCAST* ✨\n\n🏷️ *Brand:* {brandName}\n📦 *Product:* {productName} ({marketplace})\n🏷️ *Deal Type:* {dealType}\n💰 *Listed Price:* ₹{price}\n🎁 *Deal Benefit:* {offerModel}\n🔥 *Hurry:* Only {remainingSlots} slots remain!\n\n📲 *DM me right now with product screenshot to secure your slot!* 👈`;

    const offerModel =
      deal.pricingType === "LESS"
        ? `Less ₹${deal.lessAmount}`
        : deal.pricingType === "COMMISSION"
        ? `+₹${deal.commissionAmount} Mediator Comm`
        : "100% Full Refund After Review";

    template = template
      .replace(/{brandName}/g, deal.brandName)
      .replace(/{productName}/g, deal.productName)
      .replace(/{marketplace}/g, deal.marketplace)
      .replace(/{dealType}/g, deal.dealType || "Original")
      .replace(/{price}/g, deal.price)
      .replace(/{offerModel}/g, offerModel)
      .replace(/{lessAmount}/g, deal.lessAmount || 0)
      .replace(/{remainingSlots}/g, deal.remainingSlots)
      .replace(/{instructions}/g, deal.instructions || "")
      .replace(/{paymentTimeline}/g, deal.paymentTimeline || "");

    const extraLines: string[] = [];
    if (deal.instructions?.trim() && !template.includes(deal.instructions.trim())) {
      extraLines.push(`📋 *Instructions:* ${deal.instructions.trim()}`);
    }
    if (deal.paymentTimeline?.trim() && !template.includes(deal.paymentTimeline.trim())) {
      extraLines.push(`⏱️ *Payment Timeline:* ${deal.paymentTimeline.trim()}`);
    }
    if (extraLines.length > 0) {
      template += `\n\n${extraLines.join("\n")}`;
    }

    setGeneratedAnnouncement(template);
    setActiveAnnouncementDeal(deal);
  };

  const filteredDeals = deals.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (d.productName || "").toLowerCase().includes(q) ||
      (d.brandName || "").toLowerCase().includes(q) ||
      (d.productCode || "").toLowerCase().includes(q);

    const matchesPlatform =
      platformFilter === "ALL" ||
      (d.marketplace || "").toLowerCase() === platformFilter.toLowerCase();

    const matchesPricing =
      pricingFilter === "ALL" || d.pricingType === pricingFilter;

    return matchesSearch && matchesPlatform && matchesPricing;
  });

  const totalEntries = filteredDeals.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + pageSize);

  const totalOpenSlots = deals.reduce((acc, curr) => acc + (curr.remainingSlots || 0), 0);

  return (
    <div className="space-y-6 w-full">
      {/* Top Luxury Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-2xl shadow-plum-950/20 border border-gold-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
            <Flame className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            Live Deal Marketplace
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight">
            Browse Active Campaigns
          </h1>
          <p className="text-xs text-white/80 max-w-2xl font-medium">
            Explore live brand inventory, generate customized WhatsApp pitches, and share prefilled buyer order links embedded with your Agent Code <span className="text-gold-300 font-mono font-bold">#{mediatorCode}</span>.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20">
          <div>
            <span className="text-[10px] text-gold-300 font-bold uppercase tracking-wider block">Total Deals</span>
            <span className="text-2xl font-black text-white">{deals.length}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Open Slots</span>
            <span className="text-2xl font-black text-emerald-300">{totalOpenSlots}</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Switcher Strip */}
      <div className="p-4 bg-white rounded-3xl border border-plum-100 shadow-sm flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by product name, brand, SKU code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-plum-100 bg-[#FAF5F8]/60 text-xs text-plum-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-plum-400 focus:bg-white font-medium transition-all"
          />
        </div>

        {/* Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Pills */}
          <div className="flex items-center p-1 bg-plum-50/70 rounded-2xl border border-plum-100">
            {["ALL", "Amazon", "Flipkart", "Myntra"].map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  platformFilter === plat
                    ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                    : "text-gray-500 hover:text-plum-900"
                }`}
              >
                {plat === "ALL" ? "All Platforms" : plat}
              </button>
            ))}
          </div>

          {/* Pricing Model Pills */}
          <div className="flex items-center p-1 bg-plum-50/70 rounded-2xl border border-plum-100">
            {[
              { id: "ALL", label: "All Models" },
              { id: "FULL", label: "100% Refund" },
              { id: "LESS", label: "Less Deduction" },
              { id: "COMMISSION", label: "Commission" },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPricingFilter(pm.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  pricingFilter === pm.id
                    ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                    : "text-gray-500 hover:text-plum-900"
                }`}
              >
                {pm.label}
              </button>
            ))}
          </div>

          {/* View Mode Switcher: Column (Grid) vs Row (Horizontal Wide Cards) */}
          <div className="flex items-center p-1 bg-plum-50/70 rounded-2xl border border-plum-100">
            <button
              onClick={() => setViewMode("column")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "column"
                  ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                  : "text-gray-500 hover:text-plum-900"
              }`}
              title="Column View (Grid Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Column View</span>
            </button>

            <button
              onClick={() => setViewMode("row")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "row"
                  ? "bg-white text-plum-900 shadow-xs border border-plum-200"
                  : "text-gray-500 hover:text-plum-900"
              }`}
              title="Row View (Horizontal Cards)"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Row View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deals Presentation (Column View vs Row View) */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-lotus-600" />
          <p className="text-xs font-bold text-plum-900">Fetching available campaigns...</p>
          <p className="text-[11px] text-gray-400 mt-1">Connecting to live deal inventory</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-plum-100 shadow-sm">
          <Tag className="w-12 h-12 mx-auto mb-3 text-plum-300 opacity-60" />
          <h3 className="text-sm font-bold text-plum-900">No campaigns match your filters</h3>
          <p className="text-xs text-gray-400 mt-1">Try modifying your search term or clearing the platform filter.</p>
          <button
            onClick={() => {
              setSearch("");
              setPlatformFilter("ALL");
              setPricingFilter("ALL");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-plum-50 text-plum-800 text-xs font-bold border border-plum-200 hover:bg-plum-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "column" ? (
        /* Column View (Grid of big cards) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedDeals.map((deal) => (
              <DealCard
                key={deal._id}
                deal={deal}
                layout="column"
                mediatorCode={mediatorCode}
                orderFormUrl={settings?.orderFormUrl}
                orderFormProductEntryId={settings?.orderFormProductEntryId}
                orderFormMediatorEntryId={settings?.orderFormMediatorEntryId}
                onOpenMessageModal={handleOpenOrderMessage}
                onCopyAnnouncement={handleOpenAnnouncement}
              />
            ))}
          </div>

          {/* Bottom Pagination */}
          <div className="bg-white rounded-3xl border border-plum-100 p-2 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      ) : (
        /* Row View (Horizontal wide cards) */
        <div className="space-y-6">
          <div className="flex flex-col gap-5">
            {paginatedDeals.map((deal) => (
              <DealCard
                key={deal._id}
                deal={deal}
                layout="row"
                mediatorCode={mediatorCode}
                orderFormUrl={settings?.orderFormUrl}
                orderFormProductEntryId={settings?.orderFormProductEntryId}
                orderFormMediatorEntryId={settings?.orderFormMediatorEntryId}
                onOpenMessageModal={handleOpenOrderMessage}
                onCopyAnnouncement={handleOpenAnnouncement}
              />
            ))}
          </div>

          {/* Bottom Pagination */}
          <div className="bg-white rounded-3xl border border-plum-100 p-2 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      )}

      {/* WhatsApp Order Message Generator Modal */}
      <AnimatePresence>
        {activeMessageDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-plum-100 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-plum-950 text-base">
                      WhatsApp Pitch Generator
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Embedded with your Mediator Code <strong className="text-emerald-700">#{mediatorCode}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveMessageDeal(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Deal Summary Chip */}
              <div className="p-3 rounded-2xl bg-[#FAF5F8] border border-plum-100/80 mb-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-lotus-700 uppercase text-[10px] block">
                    {activeMessageDeal.brandName}
                  </span>
                  <span className="font-extrabold text-plum-950">
                    {activeMessageDeal.productName}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-plum-900 bg-white px-2.5 py-1 rounded-xl border border-plum-200">
                  ₹{activeMessageDeal.price}
                </span>
              </div>

              {/* Generated Text Box */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 mb-5">
                <textarea
                  rows={8}
                  readOnly
                  value={generatedPitch}
                  className="w-full text-xs font-mono bg-transparent text-gray-800 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPitch);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast.success("Copied pitch template!");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-plum-200 text-plum-900 font-bold text-xs hover:bg-plum-50 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-plum-600" />
                  )}
                  {copied ? "Copied!" : "Copy Pitch"}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generatedPitch)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Share on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Announcement Broadcast Modal */}
      <AnimatePresence>
        {activeAnnouncementDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-gold-300/60 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center shadow-xs">
                    <Megaphone className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-plum-950 text-base">
                      VIP Deal Broadcast Alert
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      High-converting text for WhatsApp Status & Telegram Groups
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveAnnouncementDeal(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Text Area */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 mb-5">
                <textarea
                  rows={7}
                  readOnly
                  value={generatedAnnouncement}
                  className="w-full text-xs font-mono bg-transparent text-gray-800 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedAnnouncement);
                    setAnnouncementCopied(true);
                    setTimeout(() => setAnnouncementCopied(false), 2000);
                    toast.success("Broadcast message copied!");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-plum-950 font-bold text-xs shadow-lg shadow-gold-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {announcementCopied ? (
                    <Check className="w-4 h-4 text-plum-950" />
                  ) : (
                    <Copy className="w-4 h-4 text-plum-950" />
                  )}
                  {announcementCopied ? "Copied Broadcast!" : "Copy Broadcast"}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generatedAnnouncement)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-plum-200 text-plum-900 font-bold text-xs hover:bg-plum-50 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Share Status
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
