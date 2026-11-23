"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Settings, Save, Lock, CreditCard, Award, Loader2 } from "lucide-react";

export default function MediatorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    newPassword: "",
  });

  useEffect(() => {
    fetch("/api/mediator/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setProfile(data.user);
          setFormData({
            upiId: data.user.paymentDetails?.upiId || "",
            bankName: data.user.paymentDetails?.bankName || "",
            accountNumber: data.user.paymentDetails?.accountNumber || "",
            ifscCode: data.user.paymentDetails?.ifscCode || "",
            newPassword: "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/mediator/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile & payout details updated!");
        setFormData((prev) => ({ ...prev, newPassword: "" }));
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-plum-600" />
        <p className="text-xs">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-serif text-2xl font-bold text-plum-900">Settings & Payout</h1>
        <p className="text-xs text-gray-500">Manage your agent profile, receiving UPI/bank info, and security</p>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/10 via-plum-500/10 to-lotus-500/10 border border-gold-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-500 block">Assigned Mediator Code</span>
          <span className="text-base font-mono font-bold text-plum-900">{profile?.mediatorCode || "LAX096"}</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-bold border border-gold-300">
          Verified Agent
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-6 rounded-3xl bg-white border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-plum-700" />
            <h3 className="font-bold text-plum-900 text-sm">Payout & Banking Details</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum-900 mb-1">Primary UPI ID *</label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. 9445743058@upi"
              required
              className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-plum-900 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="State Bank of India"
                className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-plum-900 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Account No."
                className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-plum-900 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="SBIN0001234"
                className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400 font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-3xl bg-white border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-plum-700" />
            <h3 className="font-bold text-plum-900 text-sm">Security & Password</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum-900 mb-1">Change Password (Leave blank to keep current)</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter at least 6 characters"
              className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl plum-gradient-bg text-white font-bold text-xs shadow hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
