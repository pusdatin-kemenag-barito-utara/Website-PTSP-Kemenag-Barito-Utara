"use client";

import * as React from "react";
import {
  Bell,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Loader2,
  Trash2,
  CheckCheck,
  ExternalLink,
  Filter,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FilterType = "all" | "unread" | "info" | "success" | "warning" | "error";

const ICON_MAP: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  success: { icon: CheckCircle, bg: "bg-emerald-100", text: "text-emerald-600" },
  warning: { icon: AlertTriangle, bg: "bg-amber-100", text: "text-amber-600" },
  error: { icon: XCircle, bg: "bg-red-100", text: "text-red-600" },
  info: { icon: Info, bg: "bg-blue-100", text: "text-blue-600" },
};

const FILTER_TABS: { key: FilterType; label: string; color?: string }[] = [
  { key: "all", label: "Semua" },
  { key: "unread", label: "Belum Dibaca" },
  { key: "info", label: "Info", color: "text-blue-600" },
  { key: "success", label: "Sukses", color: "text-emerald-600" },
  { key: "warning", label: "Peringatan", color: "text-amber-600" },
  { key: "error", label: "Error", color: "text-red-600" },
];

export function NotificationHistory() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<FilterType>("all");
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Auto-refresh every 30s when open
  React.useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "markAsRead", id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Semua notifikasi ditandai telah dibaca");
    } catch (err) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "clear" }),
      });
      setNotifications([]);
      toast.success("Riwayat notifikasi dibersihkan");
    } catch (err) {
      toast.error("Gagal membersihkan riwayat");
    }
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) handleMarkAsRead(n.id);
    if (n.link) {
      setIsOpen(false);
      router.push(n.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = React.useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  // Group by relative date
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const n of filteredNotifications) {
      const date = new Date(n.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      let key: string;
      if (diffDays === 0) key = "Hari Ini";
      else if (diffDays === 1) key = "Kemarin";
      else if (diffDays < 7) key = "Minggu Ini";
      else key = format(date, "dd MMMM yyyy", { locale: idLocale });

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    return groups;
  }, [filteredNotifications]);

  return (
    <>
      {/* Bell Button with Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
        title="Riwayat Notifikasi"
      >
        <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-sm"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[110] bg-slate-900/30 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-[120] w-full max-w-[420px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.15)] border-l border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b bg-gradient-to-b from-slate-50 to-white shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        Notifikasi
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} belum dibaca`
                          : "Semua telah dibaca"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all"
                        title="Tandai semua dibaca"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
                  {FILTER_TABS.map((tab) => {
                    const count =
                      tab.key === "all"
                        ? notifications.length
                        : tab.key === "unread"
                          ? unreadCount
                          : notifications.filter((n) => n.type === tab.key).length;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all",
                          filter === tab.key
                            ? "bg-emerald-100 text-emerald-700 shadow-sm"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {tab.label}
                        {count > 0 && (
                          <span className="ml-1.5 text-[8px] opacity-60">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-500" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Memuat notifikasi...
                    </p>
                  </div>
                )}

                {!loading && filteredNotifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
                      <Inbox className="h-10 w-10 opacity-30" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                      {filter === "all"
                        ? "Belum ada notifikasi"
                        : `Tidak ada notifikasi ${FILTER_TABS.find((t) => t.key === filter)?.label?.toLowerCase()}`}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      Aktivitas sistem akan muncul di sini
                    </p>
                  </div>
                )}

                {Object.entries(groupedNotifications).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    {/* Date Separator */}
                    <div className="sticky top-0 z-10 px-5 py-2 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {dateLabel}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-slate-50">
                      {items.map((n: any, i: number) => {
                        const config = ICON_MAP[n.type] || ICON_MAP.info;
                        const Icon = config.icon;
                        const timeAgo = formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: idLocale,
                        });

                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleNotificationClick(n)}
                            className={cn(
                              "group px-5 py-4 transition-all cursor-pointer relative",
                              n.isRead
                                ? "bg-white hover:bg-slate-50 opacity-70"
                                : "bg-white hover:bg-emerald-50/50"
                            )}
                          >
                            {/* Unread indicator */}
                            {!n.isRead && (
                              <div className="absolute top-0 left-0 w-[3px] h-full bg-emerald-500 rounded-r-full" />
                            )}

                            <div className="flex items-start gap-3.5">
                              {/* Type Icon */}
                              <div
                                className={cn(
                                  "mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                                  config.bg,
                                  config.text
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p
                                    className={cn(
                                      "text-[10px] font-black uppercase tracking-widest",
                                      n.isRead ? "text-slate-400" : "text-slate-600"
                                    )}
                                  >
                                    {n.title}
                                  </p>
                                  {!n.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-xs leading-relaxed mb-2",
                                    n.isRead
                                      ? "font-medium text-slate-500"
                                      : "font-bold text-slate-800"
                                  )}
                                >
                                  {n.message}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{timeAgo}</span>
                                  </div>
                                  {n.link && (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                      Buka
                                      <ExternalLink className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="px-5 py-4 border-t bg-slate-50/80 shrink-0 space-y-2">
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition-all"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Tandai Dibaca
                      </button>
                    )}
                    <button
                      onClick={handleClearAll}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm",
                        unreadCount > 0 ? "flex-1" : "w-full"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus Semua
                    </button>
                  </div>
                  <p className="text-center text-[9px] font-medium text-slate-400">
                    Menampilkan {filteredNotifications.length} dari{" "}
                    {notifications.length} notifikasi
                  </p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
