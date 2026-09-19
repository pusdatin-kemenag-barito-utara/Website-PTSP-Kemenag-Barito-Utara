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
      <Card className="p-3.5 border border-slate-200/70 shadow-sm bg-white rounded-xl flex flex-col h-[280px]">
        <div className="mb-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Layanan Populer</h3>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">5 Layanan dengan jumlah pengajuan terbanyak</p>
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
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Layanan Populer</h3>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">5 Layanan dengan jumlah pengajuan terbanyak</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full min-h-[190px]">
        {containerReady && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fontSize: 9.5, fontWeight: 600, fill: "#64748b" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "6px 10px",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
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
