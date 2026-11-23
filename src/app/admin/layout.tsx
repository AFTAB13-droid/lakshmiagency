import React from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import NotificationDrawer from "@/components/layout/NotificationDrawer";
import SidebarToggleBtn from "@/components/layout/SidebarToggleBtn";
import { SidebarProvider } from "@/context/SidebarContext";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-[#FAF5F8]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          {/* Top Header */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-plum-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarToggleBtn />
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-plum-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600">Platform Online</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationDrawer />
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-plum-100 text-plum-800 font-bold flex items-center justify-center text-xs shadow-xs">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-plum-900">{session.user.name}</div>
                  <div className="text-[10px] text-gray-400">Master Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full px-4 sm:px-8 py-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
