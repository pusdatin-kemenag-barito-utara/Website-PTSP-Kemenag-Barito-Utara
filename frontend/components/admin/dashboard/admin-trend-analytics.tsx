"use client";

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
      <Card className="p-6 border-none shadow-lg bg-white rounded-2xl ring-1 ring-slate-100 flex flex-col h-[400px]">
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tren Pengajuan</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-1">Aktivitas harian dalam 7 hari terakhir</p>
        </div>
        <div className="flex-1 w-full bg-slate-50/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-400">Menunggu data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-none shadow-lg bg-white rounded-2xl ring-1 ring-slate-100 flex flex-col h-[400px]">
      <div className="mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tren Pengajuan</h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1">Aktivitas harian dalam 7 hari terakhir</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full min-h-[250px]">
        {containerReady && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#059669"
                strokeWidth={3}
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
