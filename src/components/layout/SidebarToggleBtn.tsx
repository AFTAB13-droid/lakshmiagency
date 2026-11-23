"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";

export default function SidebarToggleBtn() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "bg-white/80 hover:bg-plum-50 border-plum-200 text-plum-900 shadow-sm"
          : "bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white border-gold-400/40 shadow-lg shadow-plum-950/20 hover:scale-105"
      }`}
      title={isOpen ? "Close Sidebar (Hide Menu)" : "Open Sidebar (Show Menu)"}
    >
      {isOpen ? (
        <>
          <PanelLeftClose className="w-4 h-4 text-plum-700 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold text-plum-900 hidden sm:inline">Hide Menu</span>
        </>
      ) : (
        <>
          <PanelLeftOpen className="w-4 h-4 text-gold-300 animate-pulse transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Open Menu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
          </span>
        </>
      )}
    </button>
  );
}
