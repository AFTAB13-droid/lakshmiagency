"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  CreditCard,
  LogOut,
  X,
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink,
  User,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import ThreeEmblem from "@/components/common/ThreeEmblem";

const navItems = [
  {
    label: "Dashboard",
    subLabel: "Your orders, refunds & overview",
    href: "/mediator",
    icon: LayoutDashboard,
  },
  {
    label: "My Orders & Refunds",
    subLabel: "Forms & payouts you submitted",
    href: "/mediator/orders",
    icon: ShoppingBag,
  },
  {
    label: "Browse Deals",
    subLabel: "Available slots & 1-click pitches",
    href: "/mediator/deals",
    icon: Tag,
  },
  {
    label: "My Profile",
    subLabel: "Update name & mobile number",
    href: "/mediator/profile",
    icon: User,
  },
];

export default function MediatorSidebar() {
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
            <Link href="/mediator" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                  <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
                </div>
              </div>

              <div>
                <h2 className="font-serif font-black text-plum-950 text-base leading-tight tracking-tight">
                  Lakshmi Agency
                </h2>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-100 to-plum-100 text-plum-900 text-[10px] font-extrabold uppercase tracking-wider mt-1 border border-gold-300/60 shadow-xs">
                  <Award className="w-2.5 h-2.5 text-gold-600" />
                  Premium User
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
                Agent Deal Center
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Navigation Menu (Big Luxury Items) */}
          <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== "/mediator" && pathname.startsWith(item.href));

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
                    {/* Big Icon Container */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? "bg-white/10 text-gold-300 shadow-inner border border-white/20"
                          : "bg-plum-100/70 text-plum-700 group-hover:bg-plum-200/80 group-hover:text-plum-900"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Text and Subtitle */}
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

                    {/* Right Chevron / Active Sparkle */}
                    {isActive ? (
                      <Sparkles className="w-4 h-4 text-gold-300 shrink-0 animate-pulse" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-plum-600 transition-opacity shrink-0" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Agency Forms Link Pill */}
          <div className="p-4 border-t border-plum-100/80 bg-plum-50/50 space-y-2">
            <a
              href="https://forms.gle/ydedLFJwcef59hPD7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-gold-50 border border-gold-200/80 text-xs font-bold text-plum-900 shadow-2xs transition-all group"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500" />
                Live Order Form
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-plum-700" />
            </a>

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
                    Sign Out Session
                  </div>
                  <div className="text-[10px] text-gray-400">Exit workspace</div>
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
