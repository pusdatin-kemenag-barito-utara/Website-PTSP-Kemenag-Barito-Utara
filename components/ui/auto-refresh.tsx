"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface AutoRefreshProps {
  /** Interval in milliseconds. Default: 30000 (30 seconds) */
  intervalMs?: number;
  /** Show a small indicator in the corner */
  showIndicator?: boolean;
}

export function AutoRefresh({
  intervalMs = 30000,
  showIndicator = true,
}: AutoRefreshProps) {
  const router = useRouter();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(intervalMs / 1000));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const doRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setLastRefreshed(new Date());
    setCountdown(Math.floor(intervalMs / 1000));
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    // Auto refresh interval
    intervalRef.current = setInterval(doRefresh, intervalMs);

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? Math.floor(intervalMs / 1000) : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={doRefresh}
        title={`Auto-refresh setiap ${Math.floor(intervalMs / 1000)}s. Klik untuk refresh sekarang.`}
        className="flex items-center gap-2 bg-white border border-slate-200 shadow-md rounded-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:shadow-lg transition-all group"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 text-emerald-500 transition-all ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 duration-500"}`}
        />
        <span className="font-medium">
          {isRefreshing ? "Memperbarui..." : `Refresh ${countdown}s`}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    </div>
  );
}
