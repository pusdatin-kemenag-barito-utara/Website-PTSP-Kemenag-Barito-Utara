"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export function AdminServiceAnalytics({ data }: { data: any[] }) {
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
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Layanan Populer</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-1">5 Layanan dengan jumlah pengajuan terbanyak</p>
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
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Layanan Populer</h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1">5 Layanan dengan jumlah pengajuan terbanyak</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full min-h-[250px]">
        {containerReady && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={120}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
