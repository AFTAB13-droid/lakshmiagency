"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Loader2,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import ProfileSettingsForm from "@/components/common/ProfileSettingsForm";

export default function AdminSecurityPage() {
  const { data: session } = useSession();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation states
  const isMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const isLengthValid = newPassword.length >= 6;
  const isReady = isMatch && isLengthValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("🔐 Admin password successfully updated!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch (err: any) {
      toast.error("Network error updating password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-plum-100 text-plum-900 border border-plum-200">
              Admin Credential Suite
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Direct Access (No OTP)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight mt-1.5">
            Admin Security & Password
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Update your master administrator password instantly without requiring email OTP verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white border border-plum-100 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plum-900 to-lotus-800 text-gold-300 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-plum-950">Master Administrator</div>
              <div className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]">
                {session?.user?.email || "admin@lakshmiagency.net"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile Editor (Name & Mobile Number) */}
      <ProfileSettingsForm
        title="Administrator Profile"
        subtitle="Update your admin display name and mobile number"
      />

      {/* Main Grid: Form & Info Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Password Change Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum-100/90 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-plum-50">
              <div className="w-10 h-10 rounded-2xl bg-plum-50 text-plum-800 flex items-center justify-center border border-plum-100">
                <KeyRound className="w-5 h-5 text-plum-700" />
              </div>
              <div>
                <h3 className="font-bold text-plum-950 text-sm sm:text-base">Set New Password</h3>
                <p className="text-[11px] text-gray-400">
                  Enter and confirm your new password below. It will update immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-plum-950">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-medium text-gray-800 placeholder-gray-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-plum-900 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex items-center gap-1.5 text-[11px] mt-1">
                    {isLengthValid ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Minimum 6 characters met
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Needs at least 6 characters ({newPassword.length}/6)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-plum-950">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your new password"
                    required
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 font-medium text-gray-800 placeholder-gray-400 bg-white transition-colors ${
                      confirmPassword && !isMatch
                        ? "border-red-300 focus:ring-red-400"
                        : confirmPassword && isMatch
                        ? "border-emerald-300 focus:ring-emerald-400"
                        : "border-plum-200 focus:ring-plum-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-plum-900 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px] mt-1">
                    {isMatch ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match perfectly
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match yet
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Save Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !isReady}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white font-extrabold text-xs shadow-md shadow-plum-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold-300" />
                      <span>Updating Admin Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-gold-300" />
                      <span>Update Password Now (No OTP)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security Guidance & Quick Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Direct OTP-Free Policy Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-plum-900 via-plum-800 to-lotus-900 text-white space-y-3 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-gold-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">Fast Administrator Bypass</span>
            </div>
            <h4 className="font-serif text-base font-bold text-white">
              Instant Password Sync
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Because you are currently authenticated with Master Administrator privileges, password changes are applied immediately to the database without requiring an OTP or email code.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
              <span>Security Level:</span>
              <strong className="text-gold-300">Master Level 1</strong>
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="bg-white rounded-3xl p-5 border border-plum-100 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-plum-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Password Best Practices
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Use at least 8 to 12 alphanumeric characters for optimal strength.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Include a mix of uppercase letters, numbers, and symbols (<code className="text-[11px] font-mono bg-gray-100 px-1 rounded">!@#$%</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Your new password takes effect immediately for all subsequent logins.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
