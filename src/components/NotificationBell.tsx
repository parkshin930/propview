"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/database";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        setNotifications(data as Notification[]);
      } else if (error) {
        console.error("[notifications] fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadNotifications();
  }, [open]);

  const markAsRead = async (id: string, link: string | null) => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);
    } catch (e) {
      console.error("[notifications] markAsRead error:", e);
    }
    if (link) {
      router.push(link);
      setOpen(false);
    }
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    } catch (e) {
      console.error("[notifications] markAllRead error:", e);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative text-muted-foreground hover:text-foreground dark:text-gray-100 dark:hover:text-white"
        onClick={() => setOpen((v) => !v)}
        aria-label="알림"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-background"
            aria-hidden
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-border bg-background shadow-lg py-2 z-50 dark:bg-[#111827] dark:border-gray-700"
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border dark:border-gray-700">
            <p className="text-sm font-semibold text-foreground dark:text-gray-100">
              알림
            </p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              disabled={unreadCount === 0 || !user}
            >
              모두 읽음 처리
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                불러오는 중...
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                새로운 알림이 없습니다.
              </div>
            )}
            {!loading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id, n.link)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    n.is_read
                      ? "text-muted-foreground hover:bg-muted/40"
                      : "text-foreground bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <p className="truncate">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

