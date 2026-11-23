"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Settings, Save, MessageSquare, Link as LinkIcon, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    orderFormUrl: "",
    refundFormUrl: "",
    whatsappOrderTemplate: "",
    whatsappAnnouncementTemplate: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.setting) {
          setSettings({
            orderFormUrl: data.setting.orderFormUrl || "",
            refundFormUrl: data.setting.refundFormUrl || "",
            whatsappOrderTemplate: data.setting.whatsappOrderTemplate || "",
            whatsappAnnouncementTemplate: data.setting.whatsappAnnouncementTemplate || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
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

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-plum-600" />
        <p className="text-xs">Loading agency configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-serif text-2xl font-bold text-plum-900">WhatsApp & Platform Settings</h1>
        <p className="text-xs text-gray-500">Configure global Google Form links and dynamic WhatsApp pitch templates</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Google Form URLs */}
        <div className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center font-bold">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-plum-900 text-sm">Official Google Form URLs</h3>
              <p className="text-[11px] text-gray-400">Master links embedded across all deal pitches and buyer forms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-plum-900 mb-1">Official Order Form URL</label>
              <input
                type="url"
                value={settings.orderFormUrl}
                onChange={(e) => setSettings({ ...settings, orderFormUrl: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum-900 mb-1">Official Refund Form URL</label>
              <input
                type="url"
                value={settings.refundFormUrl}
                onChange={(e) => setSettings({ ...settings, refundFormUrl: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Template Editor */}
        <div className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-plum-900 text-sm">Dynamic WhatsApp Pitch Templates</h3>
              <p className="text-[11px] text-gray-400">
                Variables: &#123;brandName&#125;, &#123;productName&#125;, &#123;marketplace&#125;, &#123;price&#125;, &#123;lessAmount&#125;, &#123;commission&#125;, &#123;remainingSlots&#125;, &#123;orderFormUrl&#125;
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum-900 mb-1">
              &quot;Order Message&quot; WhatsApp Pitch (with prefilled agent form link)
            </label>
            <textarea
              rows={6}
              value={settings.whatsappOrderTemplate}
              onChange={(e) => setSettings({ ...settings, whatsappOrderTemplate: e.target.value })}
              className="w-full p-3 rounded-xl border border-plum-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum-900 mb-1">
              &quot;Deal Announcement&quot; Broadcast (Channel Promo - No Links)
            </label>
            <textarea
              rows={4}
              value={settings.whatsappAnnouncementTemplate}
              onChange={(e) => setSettings({ ...settings, whatsappAnnouncementTemplate: e.target.value })}
              className="w-full p-3 rounded-xl border border-plum-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-plum-400 leading-relaxed"
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
            Save All Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
