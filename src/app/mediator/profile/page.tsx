"use client";

import React from "react";
import ProfileSettingsForm from "@/components/common/ProfileSettingsForm";

export default function PremiumUserProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your Premium User display name and WhatsApp / mobile number
        </p>
      </div>

      <ProfileSettingsForm
        title="Premium User Profile"
        subtitle="Update your name and mobile number used across your account"
      />
    </div>
  );
}
