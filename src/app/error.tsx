"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ArrowLeft,
  Home,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";
import ThreeEmblem from "@/components/common/ThreeEmblem";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error to console in development
    console.error("Lakshmi Agency Runtime Error Caught:", error);
  }, [error]);

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

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lotus-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-400/15 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Error Recovery Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/60 text-center"
      >
        {/* Floating 3D Lotus Emblem */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <ThreeEmblem size={110} />
          </div>
        </div>

        {/* Error Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-red-950/60 text-red-300 text-xs font-black uppercase tracking-widest border border-red-500/40 mb-3 shadow-inner">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          System Recovery Desk
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          An Unexpected Event Occurred
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/75 max-w-md mx-auto leading-relaxed mb-8">
          The application encountered a temporary processing condition. Your data is secure and undamaged.
        </p>

        {/* Action Buttons: Try Again, Go Back & Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 hover:from-gold-300 hover:to-amber-400 active:scale-95 text-plum-950 text-xs font-black tracking-wide shadow-xl shadow-gold-500/25 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-plum-950" />
            Try Again
          </button>

          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black tracking-wide border border-white/30 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-gold-300" />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold tracking-wide border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-white" />
            Home
          </Link>
        </div>

        {/* Technical Details Accordion (for admins/support) */}
        <div className="pt-4 border-t border-white/10 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs text-white/50 hover:text-white/80 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />
              Technical Error Details
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-[11px] font-mono text-red-200/90 break-words leading-relaxed max-h-40 overflow-y-auto">
                  <div className="font-bold text-red-400 mb-1">
                    {error?.name || "Error"}: {error?.message || "An unknown exception occurred"}
                  </div>
                  {error?.digest && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      Digest ID: {error.digest}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* WhatsApp Support Help Link */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/60">
          <span>Need immediate assistance?</span>
          <a
            href={`https://wa.me/919999999999?text=${encodeURIComponent(
              `Hello Lakshmi Agency Support, I encountered an error: ${error?.message || "App Error"}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-300 font-bold hover:underline flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            Contact WhatsApp Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
