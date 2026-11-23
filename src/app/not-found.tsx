"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  MessageCircle,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";
import ThreeEmblem from "@/components/common/ThreeEmblem";

export default function NotFoundPage() {
  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#1F0414] via-[#320822] to-[#14020D] text-white overflow-hidden">
      {/* 3D Mathematical Quantum Wave Background */}
      <ThreeBackground />

      {/* Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lotus-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-400/15 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic 404 Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/60 text-center"
      >
        {/* Floating 3D Lotus Emblem */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400/25 blur-2xl rounded-full" />
            <ThreeEmblem size={110} />
          </div>
        </div>

        {/* 404 Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-black uppercase tracking-widest border border-gold-400/30 mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          Error 404 • Route Not Found
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Page Lost in Luxury
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/75 max-w-md mx-auto leading-relaxed mb-8">
          The campaign link, order page, or portal you are seeking does not exist or may have been relocated by administration.
        </p>

        {/* Primary Action Buttons: Go Back & Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black tracking-wide border border-white/30 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-gold-300" />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 hover:from-gold-300 hover:to-amber-400 active:scale-95 text-plum-950 text-xs font-black tracking-wide shadow-xl shadow-gold-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-plum-950" />
            Return to Home
          </Link>
        </div>

        {/* Quick Portal Switcher */}
        <div className="pt-6 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-3">
            Quick Navigation Portals
          </span>

          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/buyer"
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] font-bold transition-all flex flex-col items-center gap-1 group"
            >
              <ShoppingBag className="w-4 h-4 text-lotus-400 group-hover:scale-110 transition-transform" />
              <span>Buyer Desk</span>
            </Link>

            <Link
              href="/mediator"
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] font-bold transition-all flex flex-col items-center gap-1 group"
            >
              <UserCheck className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
              <span>Agent Desk</span>
            </Link>

            <Link
              href="/admin"
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-[11px] font-bold transition-all flex flex-col items-center gap-1 group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Admin Desk</span>
            </Link>
          </div>
        </div>

        {/* WhatsApp Support Help Link */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/60">
          <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
          <span>Need assistance?</span>
          <a
            href="https://wa.me/919999999999?text=Hello%20Lakshmi%20Agency%20Support,%20I%20hit%20a%20404%20page%20issue."
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-300 font-bold hover:underline flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            WhatsApp Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
