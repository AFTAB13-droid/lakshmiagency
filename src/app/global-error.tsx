"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1F0414] text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-gold-400/20 text-gold-400 mx-auto mb-4 flex items-center justify-center font-serif text-2xl font-black border border-gold-400/40">
            LA
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Lakshmi Agency</h1>
          <p className="text-xs text-white/70 mb-6">
            A critical system exception was caught. Your account details remain safe.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 text-plum-950 font-bold text-xs shadow hover:opacity-95 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Application
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
