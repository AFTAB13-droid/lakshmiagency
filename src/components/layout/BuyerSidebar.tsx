"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Tag,
  FileText,
  RotateCcw,
  HelpCircle,
  LogOut,
  X,
  User,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import ThreeEmblem from "@/components/common/ThreeEmblem";

const navItems = [
  {
    label: "Explore Active Deals",
    subLabel: "Latest review & cashback campaigns",
    href: "/buyer/deals",
    icon: Tag,
  },
  {
    label: "My Orders & Tracking",
    subLabel: "Live order stage & refund claims",
    href: "/buyer",
    icon: ShoppingBag,
  },
];

export default function BuyerSidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop Blur Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-plum-950/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Large Luxury Animated Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 320 : 0,
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={`bg-white/95 backdrop-blur-2xl border-r border-plum-100/90 flex flex-col h-screen sticky top-0 shrink-0 z-40 shadow-2xl shadow-plum-950/10 overflow-hidden ${
          !isOpen ? "pointer-events-none" : ""
        }`}
        style={{ minWidth: isOpen ? 320 : 0 }}
      >
        <div className="w-[320px] flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-plum-100 flex items-center justify-between bg-gradient-to-r from-plum-50/70 via-lotus-50/30 to-white">
            <Link href="/buyer" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                  <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
                </div>
              </div>

              <div>
                <h2 className="font-serif font-black text-plum-950 text-base leading-tight tracking-tight">
                  Lakshmi Agency
                </h2>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-plum-100 to-lotus-100 text-plum-800 text-[10px] font-extrabold uppercase tracking-wider mt-1 border border-plum-200/60 shadow-xs">
                  <User className="w-2.5 h-2.5 text-plum-600" />
                  Buyer Portal
                </div>
              </div>
            </Link>

            {/* Dedicated Close Button */}
            <button
              onClick={closeSidebar}
              className="w-9 h-9 rounded-2xl bg-white border border-plum-200 text-plum-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0"
              title="Close Sidebar (Hide Menu)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive 3D Emblem Accent Pill */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-900 text-white flex items-center justify-between border-b border-gold-400/20">
            <div className="flex items-center gap-2">
              <ThreeEmblem size={28} />
              <div className="text-[11px] font-bold text-gold-200 leading-tight">
                Order Rebate Portal
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Navigation Menu (Big Luxury Items) */}
          <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex items-center gap-3.5 p-3 rounded-2xl font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white shadow-xl shadow-plum-950/20 border border-gold-400/40"
                        : "text-gray-700 hover:text-plum-950 hover:bg-plum-50/80 border border-transparent hover:border-plum-100"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "bg-white/10 text-gold-300 shadow-inner border border-white/20"
                          : "bg-plum-100/70 text-plum-700 group-hover:bg-plum-200/80 group-hover:text-plum-900"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-extrabold tracking-tight truncate ${
                          isActive ? "text-white" : "text-gray-900 group-hover:text-plum-950"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isActive ? "text-gold-200/90" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        {item.subLabel}
                      </div>
                    </div>

                    {isActive && <Sparkles className="w-4 h-4 text-gold-300 shrink-0 animate-pulse" />}
                  </motion.div>
                </Link>
              );
            })}

            {/* Quick Action Google Form Buttons */}
            <div className="pt-4 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2">
                External Google Forms
              </div>

              <a
                href="https://forms.gle/ydedLFJwcef59hPD7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-plum-50 to-white hover:from-plum-100 hover:to-plum-50 border border-plum-200/80 text-xs font-bold text-plum-900 shadow-2xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-plum-100 text-plum-800 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight font-extrabold">Order Form</div>
                    <div className="text-[10px] text-gray-500 font-normal">Submit placed order</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-plum-400 group-hover:text-plum-700" />
              </a>

              <a
                href="https://forms.gle/ssWFUKVpoxoKzKWc8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-gold-50/60 to-white hover:from-gold-100/60 hover:to-gold-50 border border-gold-200/80 text-xs font-bold text-plum-950 shadow-2xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight font-extrabold">Refund Form</div>
                    <div className="text-[10px] text-gray-500 font-normal">Submit live review</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gold-500 group-hover:text-gold-700" />
              </a>
            </div>
          </nav>

          {/* Bottom Sign Out Bar */}
          <div className="p-4 border-t border-plum-100/80 bg-gradient-to-t from-plum-50/60 to-transparent">
            <button
              onClick={async () => {
                try {
                  await signOut({ redirect: false });
                } catch (e) {
                  console.error(e);
                }
                window.location.href = "/login";
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border border-plum-100 hover:border-red-200 transition-all shadow-sm group hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-200">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-black text-gray-800 group-hover:text-red-700 truncate">
                    Sign Out
                  </div>
                  <div className="text-[10px] text-gray-400">Exit buyer portal</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
