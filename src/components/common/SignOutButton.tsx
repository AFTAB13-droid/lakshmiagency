"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
      title="Sign Out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
