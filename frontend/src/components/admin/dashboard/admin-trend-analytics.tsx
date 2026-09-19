import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AdminTrendAnalytics({ data }: { data: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkResize = () => {
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        setContainerReady(true);
      }
    };

    const observer = new ResizeObserver(checkResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!isMounted || !data || data.length === 0) {
    return (
      <Card className="p-3.5 border border-slate-200/70 shadow-sm bg-white rounded-xl flex flex-col h-[280px]">
        <div className="mb-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tren Pengajuan</h3>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">Aktivitas harian dalam 7 hari terakhir</p>
        </div>
        <div className="flex-1 w-full bg-slate-50/50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-400">Menunggu data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3.5 border border-slate-200/70 shadow-sm bg-white rounded-xl flex flex-col h-[280px]">
      <div className="mb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tren Pengajuan</h3>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Aktivitas harian dalam 7 hari terakhir</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full min-h-[190px]">
        {containerReady && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9.5, fontWeight: 600, fill: "#94a3b8" }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9.5, fontWeight: 600, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "6px 10px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
