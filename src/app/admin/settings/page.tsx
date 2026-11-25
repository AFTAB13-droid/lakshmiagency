"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Settings,
  Save,
  MessageSquare,
  Link as LinkIcon,
  Loader2,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "security" ? "security" : "platform";

  const [activeTab, setActiveTab] = useState<"platform" | "security">(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Platform settings
  const [settings, setSettings] = useState({
    orderFormUrl: "",
    refundFormUrl: "",
    orderFormProductEntryId: "",
    whatsappOrderTemplate: "",
    whatsappAnnouncementTemplate: "",
  });

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const isPasswordMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const isPasswordLengthValid = newPassword.length >= 6;
  const isPasswordReady = isPasswordMatch && isPasswordLengthValid;

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.setting) {
          setSettings({
            orderFormUrl: data.setting.orderFormUrl || "",
            refundFormUrl: data.setting.refundFormUrl || "",
            orderFormProductEntryId: data.setting.orderFormProductEntryId || "",
            whatsappOrderTemplate: data.setting.whatsappOrderTemplate || "",
            whatsappAnnouncementTemplate: data.setting.whatsappAnnouncementTemplate || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings & templates updated successfully!");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("🔐 Admin password successfully updated without OTP!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch (err) {
      toast.error("Network error updating password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-plum-600" />
        <p className="text-xs">Loading agency configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
            System & Security Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure Google Form webhook URLs, dynamic pitch templates, and master admin credentials
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-plum-100 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("platform")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "platform"
                ? "bg-plum-900 text-white shadow-xs"
                : "text-gray-500 hover:text-plum-900 hover:bg-plum-50/50"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp & Forms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "security"
                ? "bg-plum-900 text-white shadow-xs"
                : "text-gray-500 hover:text-plum-900 hover:bg-plum-50/50"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-gold-400" />
            <span>Admin Password (No OTP)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Platform & WhatsApp */}
      {activeTab === "platform" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Google Form URLs */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-plum-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-plum-50">
              <div className="w-9 h-9 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center font-bold">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-plum-950 text-sm">Official Google Form URLs</h3>
                <p className="text-[11px] text-gray-400">Master links embedded across all deal pitches and buyer forms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">Official Order Form URL</label>
                <input
                  type="url"
                  value={settings.orderFormUrl}
                  onChange={(e) => setSettings({ ...settings, orderFormUrl: e.target.value })}
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">Official Refund Form URL</label>
                <input
                  type="url"
                  value={settings.refundFormUrl}
                  onChange={(e) => setSettings({ ...settings, refundFormUrl: e.target.value })}
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-plum-50">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  Order Form: Product Code Entry ID <span className="text-gray-400 font-normal">(For Automatic Stock Tracking Prefill)</span>
                </label>
                <input
                  type="text"
                  value={settings.orderFormProductEntryId}
                  onChange={(e) => setSettings({ ...settings, orderFormProductEntryId: e.target.value })}
                  placeholder="e.g. entry.123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 bg-plum-50/50 p-2.5 rounded-xl border border-plum-100">
              💡 <strong>Tip:</strong> In Google Forms, click <strong>⋮ → Get pre-filled link</strong>, enter a test value in Product Code, and paste the <code className="font-mono text-plum-900">entry.XXXXXXXXX</code> ID here so every deal link auto-fills your Order Form!
            </p>
          </div>

          {/* WhatsApp Template Editor */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-plum-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-plum-50">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-plum-950 text-sm">Dynamic WhatsApp Pitch Templates</h3>
                <p className="text-[11px] text-gray-400">
                  Variables: &#123;brandName&#125;, &#123;productName&#125;, &#123;marketplace&#125;, &#123;price&#125;, &#123;lessAmount&#125;, &#123;commission&#125;, &#123;remainingSlots&#125;, &#123;orderFormUrl&#125;
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  &quot;Order Message&quot; WhatsApp Pitch (with prefilled agent form link)
                </label>
                <textarea
                  rows={6}
                  value={settings.whatsappOrderTemplate}
                  onChange={(e) => setSettings({ ...settings, whatsappOrderTemplate: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-plum-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  &quot;Deal Announcement&quot; Broadcast (Channel Promo - No Links)
                </label>
                <textarea
                  rows={4}
                  value={settings.whatsappAnnouncementTemplate}
                  onChange={(e) => setSettings({ ...settings, whatsappAnnouncementTemplate: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-plum-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400 leading-relaxed font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plum-900 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white font-extrabold text-xs shadow-md shadow-plum-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Configurations
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Admin Password & Security (No OTP) */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-plum-50">
                <div className="w-10 h-10 rounded-2xl bg-plum-50 text-plum-800 flex items-center justify-center border border-plum-100">
                  <KeyRound className="w-5 h-5 text-plum-700" />
                </div>
                <div>
                  <h3 className="font-bold text-plum-950 text-base">Change Admin Password</h3>
                  <p className="text-[11px] text-gray-400">
                    Set a new password directly with confirm password. No OTP required.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                    <div className="text-[11px] mt-1">
                      {isPasswordLengthValid ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Minimum 6 characters met
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Minimum 6 characters ({newPassword.length}/6)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-plum-950">
                    Confirm Password <span className="text-red-500">*</span>
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
                        confirmPassword && !isPasswordMatch
                          ? "border-red-300 focus:ring-red-400"
                          : confirmPassword && isPasswordMatch
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
                    <div className="text-[11px] mt-1">
                      {isPasswordMatch ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingPassword || !isPasswordReady}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 hover:from-plum-950 hover:to-lotus-900 text-white font-extrabold text-xs shadow-md shadow-plum-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold-300" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-gold-300" />
                        <span>Confirm & Save Password (No OTP)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Policy & Tips */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-plum-900 via-plum-800 to-lotus-900 text-white space-y-3 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 text-gold-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Direct Authority</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-white">Instant Account Security</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                As Master Administrator, you have direct clearance to reset your access password instantly without email OTP codes.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
                <span>Account:</span>
                <strong className="text-gold-300 font-mono text-[10px] truncate max-w-[170px]">
                  {session?.user?.email || "Admin"}
                </strong>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-plum-100 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black text-plum-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Rules
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Minimum 6 characters required.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>No OTP verification needed.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Effective immediately on next sign in.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
