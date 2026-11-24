"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  KeyRound,
  CheckCircle2,
  Award,
  Sparkles,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"DETAILS" | "OTP" | "MEDIATOR_PENDING">("DETAILS");
  const [registeredCode, setRegisteredCode] = useState("");
  const [role, setRole] = useState<"USER" | "PREMIUM_USER">("USER");
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    mediatorCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Strict Password Validation Rules
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    matchesConfirm: formData.password.length > 0 && formData.password === confirmPassword,
  };

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial &&
    passwordRules.matchesConfirm;

  // OTP state & timer
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.email || !formData.password || !confirmPassword) {
      triggerShake();
      toast.error("Please fill all required fields");
      return;
    }

    if (!passwordRules.minLength || !passwordRules.hasUpper || !passwordRules.hasLower || !passwordRules.hasNumber || !passwordRules.hasSpecial) {
      triggerShake();
      toast.error("Password must be at least 8 characters with upper, lower, numbers, and special character (!@#$)");
      return;
    }

    if (formData.password !== confirmPassword) {
      triggerShake();
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
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

  const handleResendOtp = async () => {
    if (cooldown > 0 || isLocked) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
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
        toast.error(data.error || "Resend failed");
      }
    } catch (err) {
      triggerShake();
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      triggerShake();
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#E83A89", "#520D38", "#FFD700"],
        });

        if (data.isMediator || role === "PREMIUM_USER") {
          setRegisteredCode(data.mediatorCode || formData.mediatorCode);
          setStep("MEDIATOR_PENDING");
          toast.success("Registration submitted! Under admin verification.");
        } else {
          toast.success("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push("/login");
          }, 1800);
        }
      } else {
        triggerShake();
        toast.error(data.error || "Verification failed");
      }
    } catch (err) {
      triggerShake();
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial-gradient relative overflow-hidden">
      {/* 3D Three.js Interactive Floating Particles */}
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
        className="w-full max-w-2xl glass-card rounded-3xl p-8 sm:p-12 gold-border relative z-10 shadow-2xl shadow-plum-950/20 backdrop-blur-3xl"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-plum-600 hover:text-plum-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-xl mx-auto mb-3">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
            </div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            {step === "MEDIATOR_PENDING" ? "Application Submitted" : "Create an Account"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            {step === "MEDIATOR_PENDING"
              ? "Your mediator registration request is under administrative review"
              : step === "DETAILS"
              ? "Join Lakshmi Agency to track orders, feedback slots & verified payouts"
              : `Enter the 6-digit verification code sent to ${formData.email}`}
          </p>
        </div>

        {step === "MEDIATOR_PENDING" ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-gold-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-gold-500/25 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black tracking-wider uppercase inline-block">
                ⏳ Under Verification
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-plum-950">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Your mediator account request has been submitted to Lakshmi Agency Administration.
              </p>
            </div>

            {/* Verification Status Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Administrative Approval Required
              </div>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                Your request is under verification. Once admin approves your request, you can login. Until approval is granted, access remains locked.
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-medium">Assigned Mediator Code:</span>
                <span className="font-mono font-black text-plum-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                  #{registeredCode || formData.mediatorCode || "PENDING"}
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all block"
            >
              Go to Member Login &rarr;
            </Link>

            <p className="text-[11px] text-gray-400">
              Note: Until admin approves your request, login will show that your account is under verification.
            </p>
          </div>
        ) : step === "DETAILS" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-plum-50/80 rounded-2xl mb-4 border border-plum-100/90 shadow-inner">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  role === "USER"
                    ? "bg-white text-plum-950 shadow-md border border-plum-200"
                    : "text-gray-500 hover:text-plum-800"
                }`}
              >
                <User className="w-4 h-4" />
                Buyer Account
              </button>
              <button
                type="button"
                onClick={() => setRole("PREMIUM_USER")}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  role === "PREMIUM_USER"
                    ? "bg-white text-plum-950 shadow-md border border-plum-200"
                    : "text-gray-500 hover:text-plum-800"
                }`}
              >
                <Award className="w-4 h-4 text-gold-600" />
                Agent / Mediator Account
              </button>
            </div>

            {/* 2-Column Fields: Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1.5">Mobile / WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="9876543210"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Address & Agent Code */}
            <div className={`grid grid-cols-1 ${role === "PREMIUM_USER" ? "sm:grid-cols-2" : ""} gap-4`}>
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-medium"
                  />
                </div>
              </div>

              {role === "PREMIUM_USER" && (
                <div>
                  <label className="block text-xs font-bold text-plum-950 mb-1.5">
                    Agent Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.mediatorCode}
                    onChange={(e) => setFormData({ ...formData, mediatorCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. LAX096"
                    className="w-full px-4 py-3.5 rounded-2xl border border-gold-300 bg-gold-50/50 text-sm font-mono font-bold text-plum-950 uppercase focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              )}
            </div>

            {/* 2-Column Fields: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. Agency@2026"
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

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Strict Password Validation Checklist */}
            {formData.password && (
              <div className="p-4 rounded-2xl bg-plum-50/80 border border-plum-100 space-y-2 text-xs">
                <div className="font-bold text-plum-900 text-[11px] uppercase tracking-wider">
                  Password Strength Requirements:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className={`flex items-center gap-1.5 ${passwordRules.minLength ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.minLength ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.hasUpper ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasLower ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.hasLower ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.hasNumber ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.hasSpecial ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>Special (!@#$)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.matchesConfirm ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordRules.matchesConfirm ? "text-emerald-600" : "text-gray-300"}`} />
                    <span>Passwords Match</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                "Verify Email & Create Account"
              )}
            </button>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-black text-lotus-600 hover:text-lotus-700 hover:underline">
                Sign in to portal
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
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
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-center text-xl font-bold tracking-[0.3em] text-plum-950 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Resend Timer Alert */}
            {isLocked ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <span>Maximum 3 attempts reached. Please try again after 1 hour.</span>
              </div>
            ) : cooldown > 0 ? (
              <div className="p-3 rounded-2xl bg-plum-50/80 border border-plum-100 flex items-center justify-center gap-2 text-xs text-plum-800 font-bold">
                <Clock className="w-4 h-4 text-lotus-600 animate-spin" />
                Resend verification code in {cooldown}s
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Didn&apos;t receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-black text-lotus-600 hover:underline"
                >
                  Resend OTP ({attempts === 1 ? "Wait 30s" : "Wait 65s"})
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Account...
                </>
              ) : (
                "Verify Code & Finish Sign Up"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("DETAILS")}
              className="w-full text-center text-xs font-bold text-gray-400 hover:text-plum-900 transition-colors"
            >
              &larr; Change registration details
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
