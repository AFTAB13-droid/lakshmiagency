import React from "react";
import MediatorSidebar from "@/components/layout/MediatorSidebar";
import NotificationDrawer from "@/components/layout/NotificationDrawer";
import SidebarToggleBtn from "@/components/layout/SidebarToggleBtn";
import { SidebarProvider } from "@/context/SidebarContext";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MediatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== "PREMIUM_USER") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-[#FAF5F8]">
        <MediatorSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-plum-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarToggleBtn />
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-plum-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600">Agent Workspace</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationDrawer />
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-right">
                <div className="text-xs font-bold text-plum-900">{session.user.name}</div>
                {/* @ts-ignore */}
                <div className="text-[10px] text-gold-600 font-mono font-black tracking-wide">
                  {/* @ts-ignore */}
                  AGENT ID: {session.user.mediatorCode || "LAX096"}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full px-4 sm:px-8 py-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
