"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  // OTP attempts & timer
  const [attempts, setAttempts] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setStep("OTP");
        setAttempts(data.attempts || 1);
        setCooldown(data.cooldownSeconds || 30);
      } else {
        triggerShake();
        if (res.status === 429 && data.error.includes("1 hour")) {
          setIsLocked(true);
        }
        toast.error(data.error || "Failed to send code");
      }
    } catch (err) {
      triggerShake();
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0 || isLocked) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New verification code sent!");
        setAttempts(data.attempts || attempts + 1);
        setCooldown(data.cooldownSeconds || 65);
      } else {
        triggerShake();
        if (res.status === 429 && data.error.includes("1 hour")) {
          setIsLocked(true);
        }
        toast.error(data.error || "Failed to resend code");
      }
    } catch (err) {
      triggerShake();
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      triggerShake();
      return;
    }

    if (newPassword.length < 8) {
      triggerShake();
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password reset successful! Redirecting...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        triggerShake();
        toast.error(data.error || "Failed to reset password");
      }
    } catch (err) {
      triggerShake();
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial-gradient relative overflow-hidden">
      <ThreeBackground />

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-lotus-200/30 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gold-200/30 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={
          shake
            ? { x: [-16, 16, -12, 12, -7, 7, -3, 3, 0], transition: { duration: 0.5 } }
            : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
        }
        className="w-full max-w-xl glass-card rounded-3xl p-8 sm:p-12 gold-border relative z-10 shadow-2xl shadow-plum-950/20 backdrop-blur-3xl"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-plum-600 hover:text-plum-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-xl mx-auto mb-3.5">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
            </div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            {step === "EMAIL"
              ? "Enter your registered email address to receive an instant verification OTP"
              : `Enter the 6-digit code sent to ${email} and choose a new password`}
          </p>
        </div>

        {step === "EMAIL" ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-plum-950 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-plum-950">6-Digit Verification Code</label>
                <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded-lg border border-gold-200">
                  Attempt {attempts} of 3
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-center text-lg font-bold tracking-[0.25em] text-plum-950 transition-all font-mono"
                />
              </div>
            </div>

            {/* Resend Timer Alert */}
            {isLocked ? (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Maximum 3 attempts reached. Please try again after 1 hour.</span>
              </div>
            ) : cooldown > 0 ? (
              <div className="p-3 rounded-2xl bg-plum-50/80 border border-plum-100 flex items-center justify-center gap-2 text-xs text-plum-800 font-bold">
                <Clock className="w-4 h-4 text-lotus-600 animate-spin" />
                Resend code in {cooldown}s
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Didn&apos;t get the email?</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="font-black text-lotus-600 hover:underline"
                >
                  Resend OTP ({attempts === 1 ? "Wait 30s" : "Wait 65s"})
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-plum-950 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Save New Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("EMAIL")}
              className="w-full text-center text-xs font-bold text-gray-400 hover:text-plum-900 transition-colors"
            >
              &larr; Try another email
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
