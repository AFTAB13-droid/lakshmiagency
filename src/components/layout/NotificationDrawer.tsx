"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bell,
  X,
  CheckCheck,
  Check,
  Clock,
  Package,
  RotateCcw,
  AlertCircle,
  Trash2,
  Volume2,
  VolumeX,
  RefreshCw,
  MailCheck,
  Mail,
  Sparkles,
} from "lucide-react";
import { playNotificationSound, playActionPopSound } from "@/lib/sound";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track previous unread count to trigger chime on new notification
  const prevUnreadRef = useRef<number>(0);
  const isInitialMount = useRef<boolean>(true);

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setFetching(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        const newUnread = data.unreadCount || 0;

        // Trigger chime sound if new notification arrived and sound is enabled
        if (!isInitialMount.current && newUnread > prevUnreadRef.current && soundEnabled) {
          playNotificationSound();
          toast("New alert received!", {
            icon: "🔔",
            style: {
              borderRadius: "16px",
              background: "#320822",
              color: "#fff",
              border: "1px solid rgba(212, 175, 55, 0.4)",
            },
          });
        }

        prevUnreadRef.current = newUnread;
        setUnreadCount(newUnread);
        isInitialMount.current = false;
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (isManual) setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications(false);
      }
    }, 9000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [soundEnabled]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      toast.success("All notifications marked as read");

      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (err) {
      toast.error("Failed to mark all as read");
      fetchNotifications();
    }
  };

  // Toggle single notification read / unread status
  const handleToggleReadStatus = async (notificationId: string, currentReadStatus: boolean) => {
    const newStatus = !currentReadStatus;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: newStatus } : n))
      );
      const newUnread = newStatus
        ? Math.max(0, unreadCount - 1)
        : unreadCount + 1;
      setUnreadCount(newUnread);
      prevUnreadRef.current = newUnread;

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, isRead: newStatus }),
      });
    } catch (err) {
      toast.error("Failed to update status");
      fetchNotifications();
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playActionPopSound();
    try {
      // Optimistic update
      const target = notifications.find((n) => n._id === notificationId);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification removed");

      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      toast.error("Failed to delete notification");
      fetchNotifications();
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    playActionPopSound();
    setConfirmClearAll(false);
    try {
      // Optimistic update
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      toast.success("All notifications deleted");

      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
    } catch (err) {
      toast.error("Failed to clear notifications");
      fetchNotifications();
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "UNREAD") return !n.isRead;
    if (filterTab === "READ") return n.isRead;
    return true;
  });

  return (
    <>
      {/* Bell Trigger Button with Lively Swinging Animation */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (unreadCount > 0 && soundEnabled) {
            playNotificationSound();
          }
        }}
        className="relative p-2.5 rounded-2xl text-plum-900 hover:text-plum-950 hover:bg-plum-50/80 transition-all border border-plum-100 shadow-xs"
        title="Open Notification Center"
      >
        <motion.div
          animate={
            unreadCount > 0
              ? {
                  rotate: [0, -18, 18, -14, 14, -8, 8, -4, 4, 0],
                  transition: {
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    duration: 0.85,
                    ease: "easeInOut",
                  },
                }
              : {}
          }
        >
          <Bell className="w-5 h-5 text-plum-800" />
        </motion.div>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-lotus-600 to-pink-600 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-lotus-500/30 border-2 border-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Drawer Portalled to Document Body */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[9999] overflow-hidden bg-plum-950/50 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-plum-100 relative"
            >
              {/* Top Luxury Header */}
              <div className="p-4 sm:p-5 border-b border-plum-100 bg-gradient-to-r from-plum-900 via-plum-800 to-lotus-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-gold-300 flex items-center justify-center font-bold border border-white/20 shadow-xs">
                    <Bell className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-white text-base tracking-tight">
                      Alert Center
                    </h3>
                    <p className="text-[11px] text-gold-300 font-bold">
                      {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound Toggle & Test */}
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playNotificationSound();
                      toast.success(next ? "Chime sound enabled" : "Chime sound muted");
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={soundEnabled ? "Mute alert chimes" : "Enable loud alert chimes"}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-gold-300" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-white/50" />
                    )}
                  </button>

                  {/* Speedy Manual Refresh */}
                  <button
                    onClick={() => fetchNotifications(true)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Refresh alerts"
                  >
                    <RefreshCw className={`w-4 h-4 text-white ${fetching ? "animate-spin" : ""}`} />
                  </button>

                  {/* Close Drawer */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Toolbar Strip */}
              <div className="px-4 py-3 bg-[#FAF5F8] border-b border-plum-100 flex items-center justify-between gap-2">
                {/* Filter Pills */}
                <div className="flex items-center p-1 bg-white rounded-xl border border-plum-100 shadow-2xs">
                  <button
                    onClick={() => setFilterTab("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      filterTab === "ALL"
                        ? "bg-plum-900 text-white shadow-xs"
                        : "text-gray-500 hover:text-plum-900"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilterTab("UNREAD")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      filterTab === "UNREAD"
                        ? "bg-plum-900 text-white shadow-xs"
                        : "text-gray-500 hover:text-plum-900"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilterTab("READ")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      filterTab === "READ"
                        ? "bg-plum-900 text-white shadow-xs"
                        : "text-gray-500 hover:text-plum-900"
                    }`}
                  >
                    Read ({notifications.length - unreadCount})
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-1.5 px-2 rounded-xl bg-white hover:bg-plum-50 border border-plum-200 text-plum-900 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Mark All</span>
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={() => setConfirmClearAll(true)}
                      className="p-1.5 px-2 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Delete all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span className="hidden sm:inline">Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Delete All Dialog */}
              <AnimatePresence>
                {confirmClearAll && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-900 flex items-center justify-between"
                  >
                    <span className="font-bold">Delete all notifications permanently?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAllNotifications}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold shadow-xs hover:bg-red-700"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        onClick={() => setConfirmClearAll(false)}
                        className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[11px] font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification List Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-plum-50 flex items-center justify-center mb-3">
                      <Bell className="w-8 h-8 text-plum-300 opacity-60" />
                    </div>
                    <p className="text-xs font-bold text-plum-900">No alerts found</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                      {filterTab === "UNREAD"
                        ? "You are all caught up! No unread messages."
                        : "You will receive alerts here when orders, reviews, or payouts update."}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <motion.div
                      key={n._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-3.5 rounded-2xl border text-xs transition-all duration-200 relative group ${
                        n.isRead
                          ? "bg-white border-gray-100 hover:border-plum-200 text-gray-700 shadow-2xs"
                          : "bg-gradient-to-br from-plum-50/90 to-lotus-50/50 border-lotus-200 text-plum-950 font-medium shadow-xs"
                      }`}
                    >
                      {/* Unread Accent Left Line */}
                      {!n.isRead && (
                        <div className="absolute top-3 bottom-3 left-0 w-1 bg-gradient-to-b from-lotus-500 to-pink-500 rounded-r-full" />
                      )}

                      <div className="flex items-start justify-between gap-2 mb-1.5 pl-1.5">
                        <div className="flex items-center gap-1.5">
                          {n.type === "ORDER_CREATED" && (
                            <Package className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          )}
                          {n.type === "REFUND_SUBMITTED" && (
                            <RotateCcw className="w-3.5 h-3.5 text-lotus-600 shrink-0" />
                          )}
                          <span className="font-extrabold text-[12px] text-plum-950">
                            {n.title}
                          </span>
                        </div>

                        {/* Top Timestamp & Read Dot */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-lotus-500 animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Notification Message */}
                      <p className="text-[11px] text-gray-600 pl-1.5 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Card Footer Actions (Mark Read/Unread & Delete) */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100/70 flex items-center justify-between text-[11px] pl-1.5">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Read/Unread */}
                          <button
                            onClick={() => handleToggleReadStatus(n._id, n.isRead)}
                            className="p-1 px-2 rounded-lg bg-gray-50 hover:bg-plum-50 border border-gray-200 text-gray-600 hover:text-plum-900 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title={n.isRead ? "Mark as unread" : "Mark as read"}
                          >
                            {n.isRead ? (
                              <>
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>Unread</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Read</span>
                              </>
                            )}
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={(e) => handleDeleteNotification(n._id, e)}
                            className="p-1 px-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Delete this alert"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer Status */}
              <div className="p-3 border-t border-plum-100 bg-[#FAF5F8] flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-gray-600">Realtime Alert Desk</span>
                </div>

                <button
                  onClick={() => playNotificationSound()}
                  className="text-lotus-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Chime
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
