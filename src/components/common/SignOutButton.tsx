"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error("SignOut error:", e);
    }
    // Hard navigate directly to origin /login to avoid any localhost redirect
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Sign Out"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
    </button>
  );
}
