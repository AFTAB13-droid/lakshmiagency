import React from "react";
import BuyerSidebar from "@/components/layout/BuyerSidebar";
import NotificationDrawer from "@/components/layout/NotificationDrawer";
import SidebarToggleBtn from "@/components/layout/SidebarToggleBtn";
import SignOutButton from "@/components/common/SignOutButton";
import { SidebarProvider } from "@/context/SidebarContext";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-[#FAF5F8]">
        <BuyerSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          {/* Top Navbar */}
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-plum-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarToggleBtn />
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-plum-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600">Buyer Workspace</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationDrawer />
              <div className="h-5 w-px bg-gray-200" />
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-plum-900">{session.user.name}</div>
                <div className="text-[10px] text-gray-400">{session.user.email}</div>
              </div>
              <SignOutButton />
            </div>
          </header>

          <main className="flex-1 w-full px-4 sm:px-8 py-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
