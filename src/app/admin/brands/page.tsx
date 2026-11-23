"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Store, Plus, Loader2, Globe, Tag } from "lucide-react";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [brandName, setBrandName] = useState("");
  const [mktName, setMktName] = useState("");

  const fetchData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch("/api/admin/brands"),
        fetch("/api/admin/marketplaces"),
      ]);
      const bData = await bRes.json();
      const mData = await mRes.json();
      if (bData.success) setBrands(bData.brands);
      if (mData.success) setMarketplaces(mData.marketplaces);
    } catch (err) {
      toast.error("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Brand '${brandName}' added!`);
        setBrandName("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to add brand");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleAddMarketplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mktName.trim()) return;
    try {
      const res = await fetch("/api/admin/marketplaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: mktName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Platform '${mktName}' added!`);
        setMktName("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to add platform");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-plum-900">Brands & Platforms</h1>
        <p className="text-xs text-gray-500">Manage client brands and e-commerce platforms available for deal creation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brands Section */}
        <div className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-plum-900 text-sm">Client Brands</h3>
              <p className="text-[11px] text-gray-400">Total: {brands.length} active brands</p>
            </div>
          </div>

          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Organic Harvest"
              className="flex-1 px-3.5 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl plum-gradient-bg text-white font-bold text-xs shadow hover:opacity-95"
            >
              Add Brand
            </button>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {brands.map((b) => (
              <div
                key={b._id}
                className="p-3 rounded-xl bg-plum-50/50 border border-plum-100/60 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-plum-900">{b.name}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplaces Section */}
        <div className="bg-white rounded-3xl p-6 border border-plum-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-plum-900 text-sm">E-Commerce Platforms</h3>
              <p className="text-[11px] text-gray-400">Total: {marketplaces.length} platforms</p>
            </div>
          </div>

          <form onSubmit={handleAddMarketplace} className="flex gap-2">
            <input
              type="text"
              value={mktName}
              onChange={(e) => setMktName(e.target.value)}
              placeholder="e.g. Nykaa / Tata Cliq"
              className="flex-1 px-3.5 py-2 rounded-xl border border-plum-100 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-white font-bold text-xs shadow hover:opacity-95"
            >
              Add Platform
            </button>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {marketplaces.map((m) => (
              <div
                key={m._id}
                className="p-3 rounded-xl bg-gold-50/40 border border-gold-200/60 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-plum-900">{m.name}</span>
                <span className="text-[10px] text-gray-500 font-mono">#{m.slug}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
