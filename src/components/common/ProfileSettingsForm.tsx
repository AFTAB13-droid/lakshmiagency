"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  Award,
} from "lucide-react";

export default function ProfileSettingsForm({
  title = "My Profile Details",
  subtitle = "Update your display name and WhatsApp / mobile contact number",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setName(data.user.name || "");
          setMobile(data.user.mobile || "");
          setEmail(data.user.email || "");
          setRole(data.user.role || "");
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name: data.user.name });
        toast.success("Profile name & number updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = () => {
    if (role === "ADMIN") {
      return {
        label: "Administrator",
        icon: <Shield className="w-3.5 h-3.5 text-lotus-600" />,
        cls: "bg-plum-100 text-plum-950 border-plum-200",
      };
    }
    if (role === "PREMIUM_USER") {
      return {
        label: "Premium User",
        icon: <Award className="w-3.5 h-3.5 text-gold-600" />,
        cls: "bg-amber-50 text-amber-900 border-amber-200",
      };
    }
    return {
      label: "Buyer Account",
      icon: <User className="w-3.5 h-3.5 text-indigo-600" />,
      cls: "bg-indigo-50 text-indigo-900 border-indigo-200",
    };
  };

  const badge = getRoleBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-plum-100 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-plum-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-plum-900 to-lotus-800 text-gold-300 flex items-center justify-center font-serif font-black text-lg shadow-sm shrink-0">
            {name ? name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="font-serif font-bold text-plum-950 text-base sm:text-lg">{title}</h2>
            <p className="text-[11px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        {role && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border self-start sm:self-auto ${badge.cls}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-plum-600" />
          <p className="text-xs">Loading your profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-950 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-plum-200 text-xs font-bold text-plum-950 focus:outline-none focus:ring-2 focus:ring-plum-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-950 mb-1.5">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-plum-200 text-xs font-mono font-bold text-plum-950 focus:outline-none focus:ring-2 focus:ring-plum-400 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              Registered Email Address <span className="font-normal text-[10px]">(Login ID - Read Only)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Updates sync immediately across your portal
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl plum-gradient-bg text-white text-xs font-black shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-gold-300" />}
              Save Profile
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
