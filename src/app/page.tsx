"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RotateCcw, LogIn, ShieldAlert, Sparkles, X, ChevronRight, UserPlus } from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";
import ThreeEmblem from "@/components/common/ThreeEmblem";

export default function HomePage() {
  const [showGuidelines, setShowGuidelines] = useState(false);

  const agencyRules = [
    { step: 1, title: "Place Order", desc: "Purchase product through the official link provided by your agent." },
    { step: 2, title: "Submit Order Form", desc: "Fill out the official Order Form immediately once your order is placed." },
    { step: 3, title: "Delivery Confirmation", desc: "Wait for delivery. Inform us once the product arrives safely." },
    { step: 4, title: "Review Submission", desc: "Submit product review within 4 to 5 days from delivery date (pic reviews preferred)." },
    { step: 5, title: "Refund Claim", desc: "Once your review is live on the marketplace, submit the Refund Form right away." },
    { step: 6, title: "20-Day Strict Window", desc: "Refund form must be completed within 20 days of delivery to qualify for payment." },
    { step: 7, title: "Payout Timeline", desc: "Refunds disbursed in 20 to 25 working days (excluding Saturdays, Sundays & holidays)." },
    { step: 8, title: "Forms Only Policy", desc: "Only official form submissions are accepted. Sending details in chat will not qualify." },
    { step: 9, title: "Fee Exclusions", desc: "COD charges, platform fees, marketplace fees, and supercoins are strictly non-refundable." },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-radial-gradient">
      {/* 3D Floating Gold & Lotus Particles */}
      <ThreeBackground />

      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-lotus-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold-200/30 blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl glass-card rounded-3xl p-8 sm:p-12 gold-border relative z-10 text-center shadow-2xl shadow-plum-950/20 backdrop-blur-3xl"
      >
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-xl mb-3">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
              <Image
                src="/logo.jpg"
                alt="Lakshmi Agency Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            Lakshmi Agency
          </h1>
          <p className="text-xs font-bold text-gold-600 tracking-wider italic mt-0.5">
            Your Needs... Our Priority...
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-plum-50 border border-plum-100 text-[11px] font-bold text-plum-700 shadow-xs">
            <Sparkles className="w-3 h-3 text-gold-500 animate-pulse" />
            E-Commerce Review & Mediation Platform
          </div>
        </div>

        {/* 2 Primary Action Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={process.env.NEXT_PUBLIC_ORDER_FORM_URL || "https://forms.gle/ydedLFJwcef59hPD7"}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-gradient-to-b from-white to-lotus-50/50 border border-lotus-200/60 hover:border-lotus-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-lotus-100 flex items-center justify-center text-lotus-600 mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-plum-800">Order Form</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Submit new order</span>
          </a>

          <a
            href={process.env.NEXT_PUBLIC_REFUND_FORM_URL || "https://forms.gle/ssWFUKVpoxoKzKWc8"}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-gradient-to-b from-white to-gold-50/50 border border-gold-200/60 hover:border-gold-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 mb-2 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-plum-800">Refund Form</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Claim your refund</span>
          </a>
        </div>

        {/* Portal Sign In & Register Buttons */}
        <div className="space-y-2 mb-3">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-800/20 hover:shadow-plum-800/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <LogIn className="w-4 h-4 text-gold-300" />
            Member Portal Login
            <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
          </Link>

          <Link
            href="/signup"
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-gold-50 text-plum-900 font-bold text-xs flex items-center justify-center gap-2 border border-gold-300 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-gold-600" />
            Create Account with OTP (Buyer / Mediator)
          </Link>
        </div>

        {/* View 9-Step Agency Guidelines Trigger */}
        <button
          onClick={() => setShowGuidelines(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-plum-100 bg-white/70 hover:bg-plum-50/60 text-plum-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-gold-600" />
          View 9-Step Guidelines & Rules
        </button>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-plum-50 text-[11px] text-gray-400">
          &copy; 2026 Lakshmi Agency. All rights reserved.
        </div>
      </motion.div>

      {/* 9-Step Policy Modal */}
      <AnimatePresence>
        {showGuidelines && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gold-200 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-lotus-100 flex items-center justify-center text-lotus-600 font-bold text-sm">
                    LA
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-plum-800 text-base">Agency Policy & Steps</h3>
                    <p className="text-[11px] text-gold-600 font-medium">Standard Operating Guidelines</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 py-4 space-y-3 pr-1 text-left">
                {agencyRules.map((rule) => (
                  <div
                    key={rule.step}
                    className="p-3 rounded-2xl bg-plum-50/40 border border-plum-100/60 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-gold-500 to-lotus-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      {rule.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-plum-900">{rule.title}</h4>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 text-center">
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="w-full py-2.5 rounded-xl plum-gradient-bg text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                >
                  I Understand & Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
