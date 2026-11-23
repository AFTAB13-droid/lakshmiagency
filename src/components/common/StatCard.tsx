"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  RotateCcw,
  IndianRupee,
  Receipt,
  Wallet,
  Tag,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  package: Package,
  refund: RotateCcw,
  rupee: IndianRupee,
  receipt: Receipt,
  wallet: Wallet,
  tag: Tag,
  users: Users,
  "shopping-bag": ShoppingBag,
  clock: Clock,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
  trending: TrendingUp,
};

export type StatIconProp =
  | LucideIcon
  | "package"
  | "refund"
  | "rupee"
  | "receipt"
  | "wallet"
  | "tag"
  | "users"
  | "shopping-bag"
  | "clock"
  | "check-circle"
  | "sparkles"
  | "trending"
  | string;

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: StatIconProp;
  subtext?: string;
  trend?: string;
  colorScheme?: "plum" | "lotus" | "gold" | "emerald" | "blue" | "amber";
  onClick?: () => void;
}

const COLOR_MAP = {
  plum: {
    bg: "from-plum-900/5 via-plum-800/10 to-transparent",
    border: "border-plum-200/80 hover:border-plum-400",
    iconBg: "bg-gradient-to-br from-plum-800 to-plum-950 text-gold-300 shadow-plum-900/20",
    valueColor: "text-plum-950",
    glow: "bg-plum-500/10",
    dot: "bg-plum-600",
  },
  lotus: {
    bg: "from-lotus-500/5 via-lotus-400/10 to-transparent",
    border: "border-lotus-200/80 hover:border-lotus-400",
    iconBg: "bg-gradient-to-br from-lotus-600 to-pink-700 text-white shadow-lotus-500/20",
    valueColor: "text-lotus-900",
    glow: "bg-lotus-500/10",
    dot: "bg-lotus-500",
  },
  gold: {
    bg: "from-gold-500/5 via-gold-400/10 to-transparent",
    border: "border-gold-300/80 hover:border-gold-400",
    iconBg: "bg-gradient-to-br from-gold-500 to-amber-600 text-plum-950 shadow-gold-500/20",
    valueColor: "text-amber-950",
    glow: "bg-gold-500/10",
    dot: "bg-gold-500",
  },
  emerald: {
    bg: "from-emerald-500/5 via-emerald-400/10 to-transparent",
    border: "border-emerald-200/80 hover:border-emerald-400",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20",
    valueColor: "text-emerald-950",
    glow: "bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  blue: {
    bg: "from-blue-500/5 via-blue-400/10 to-transparent",
    border: "border-blue-200/80 hover:border-blue-400",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20",
    valueColor: "text-blue-950",
    glow: "bg-blue-500/10",
    dot: "bg-blue-500",
  },
  amber: {
    bg: "from-amber-500/5 via-amber-400/10 to-transparent",
    border: "border-amber-200/80 hover:border-amber-400",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20",
    valueColor: "text-amber-950",
    glow: "bg-amber-500/10",
    dot: "bg-amber-500",
  },
};

export default function StatCard({
  label,
  value,
  icon = "sparkles",
  subtext,
  trend,
  colorScheme = "plum",
  onClick,
}: StatCardProps) {
  const scheme = COLOR_MAP[colorScheme] || COLOR_MAP.plum;

  // Resolve icon safely across Server/Client boundary
  let IconComponent: LucideIcon = Sparkles;
  if (typeof icon === "string") {
    IconComponent = ICON_MAP[icon] || Sparkles;
  } else if (icon) {
    IconComponent = icon;
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.018 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white border ${
        scheme.border
      } bg-gradient-to-br ${
        scheme.bg
      } shadow-sm hover:shadow-xl hover:shadow-plum-950/5 transition-all ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Background Decorative Blur Orb */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${scheme.glow} blur-2xl pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot} animate-pulse`} />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {label}
            </span>
          </div>

          <h3 className={`text-2xl sm:text-3xl font-black ${scheme.valueColor} tracking-tight font-serif`}>
            {value}
          </h3>

          {subtext && (
            <p className="text-[11px] text-gray-400 font-medium pt-0.5">{subtext}</p>
          )}
        </div>

        {/* Icon Pill */}
        <div
          className={`w-12 h-12 rounded-2xl ${scheme.iconBg} flex items-center justify-center shrink-0 shadow-lg`}
        >
          <IconComponent className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[10px]">
          <span className="text-gray-400">Activity</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
            {trend}
          </span>
        </div>
      )}
    </motion.div>
  );
}
