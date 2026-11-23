"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, Sparkles, Shield, User, Award } from "lucide-react";
import ThreeBackground from "@/components/common/ThreeBackground";

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"USER" | "PREMIUM_USER" | "ADMIN">("PREMIUM_USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerShake();
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        triggerShake();
        toast.error(res.error || "Authentication failed");
      } else {
        toast.success("Welcome back to Lakshmi Agency!");
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const userRole = session?.user?.role;

        if (userRole === "ADMIN") {
          router.push("/admin");
        } else if (userRole === "PREMIUM_USER") {
          router.push("/mediator");
        } else {
          router.push("/buyer");
        }
      }
    } catch (err) {
      triggerShake();
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial-gradient relative overflow-hidden">
      {/* 3D Three.js Interactive Floating Particles */}
      <ThreeBackground />

      {/* Decorative background glows */}
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
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-plum-600 hover:text-plum-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-500 via-lotus-500 to-plum-700 shadow-xl mx-auto mb-3.5">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
            </div>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            Member Portal
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Secure access to your campaigns, order streams & mediation desk
          </p>
        </div>

        {/* 3-Role Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-plum-50/80 rounded-2xl mb-6 border border-plum-100/90 shadow-inner">
          <button
            type="button"
            onClick={() => setRoleTab("USER")}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              roleTab === "USER"
                ? "bg-white text-plum-950 shadow-md border border-plum-200"
                : "text-gray-500 hover:text-plum-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRoleTab("PREMIUM_USER")}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              roleTab === "PREMIUM_USER"
                ? "bg-white text-plum-950 shadow-md border border-plum-200"
                : "text-gray-500 hover:text-plum-800"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-gold-600" />
            Agent / Mediator
          </button>
          <button
            type="button"
            onClick={() => setRoleTab("ADMIN")}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              roleTab === "ADMIN"
                ? "bg-white text-plum-950 shadow-md border border-plum-200"
                : "text-gray-500 hover:text-plum-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-lotus-600" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-plum-950 mb-1.5">
              Email Address / Account Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-plum-950">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-lotus-600 hover:text-lotus-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-plum-200 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 text-sm text-gray-900 transition-all font-medium"
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
            className="w-full py-4 px-6 rounded-2xl plum-gradient-bg text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-plum-900/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              `Sign In as ${
                roleTab === "PREMIUM_USER"
                  ? "Premium Agent"
                  : roleTab === "ADMIN"
                  ? "Master Administrator"
                  : "Verified Buyer"
              }`
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs sm:text-sm text-gray-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-black text-lotus-600 hover:text-lotus-700 hover:underline">
            Register now with OTP
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
