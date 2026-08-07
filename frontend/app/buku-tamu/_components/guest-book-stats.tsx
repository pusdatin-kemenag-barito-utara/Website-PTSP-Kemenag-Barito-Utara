"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TrendingUp, UserCheck, Building2, Users, BarChart3, PieChartIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { ModernMonthPicker } from "@/components/ui/modern-month-picker";
import { BarChart, DonutChart } from "./guest-book-charts";
import { GuestEntry } from "./types";
import { formatDateHeading, formatMonthHeading, isSameDay, isSameMonth } from "./utils";

interface GuestBookStatsProps {
  entries: GuestEntry[];
  onSwitchTab: (tab: "form" | "list" | "stats") => void;
}

export default function GuestBookStats({ entries, onSwitchTab }: GuestBookStatsProps) {
  // Stats Filter States
  const [statsFilterType, setStatsFilterType] = useState<"harian" | "bulanan">("harian");
  const [statsDate, setStatsDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [statsMonth, setStatsMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [statsChartType, setStatsChartType] = useState<"batang" | "lingkaran">("batang");

  // Submitted Stats States (Rendered States)
  const [showChart, setShowChart] = useState(true);
  const [lastViewedFilterType, setLastViewedFilterType] = useState<"harian" | "bulanan">("harian");
  const [lastViewedDate, setLastViewedDate] = useState(statsDate);
  const [lastViewedMonth, setLastViewedMonth] = useState(statsMonth);
  const [lastViewedChartType, setLastViewedChartType] = useState<"batang" | "lingkaran">("batang");
  const [chartMetricType, setChartMetricType] = useState<"instansi" | "pejabat">("instansi");

  const handleViewStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (statsFilterType === "harian" && !statsDate) {
      toast.error("Pilih Tanggal Kunjungan", { description: "Silakan tentukan tanggal kunjungan terlebih dahulu." });
      return;
    }
    if (statsFilterType === "bulanan" && !statsMonth) {
      toast.error("Pilih Bulan Kunjungan", { description: "Silakan tentukan bulan kunjungan terlebih dahulu." });
      return;
    }

    setLastViewedFilterType(statsFilterType);
    setLastViewedDate(statsDate);
    setLastViewedMonth(statsMonth);
    setLastViewedChartType(statsChartType);
    setShowChart(true);
  };

  // Filter entries for selected statistics
  const statsEntries = entries.filter((entry: any) => {
    const visitDate = entry.visitDate || entry.visit_date || entry.created_at || "";
    if (lastViewedFilterType === "harian") {
      return isSameDay(visitDate, lastViewedDate);
    } else {
      return isSameMonth(visitDate, lastViewedMonth);
    }
  });

  // Math Calculations
  const totalStatsTamu = statsEntries.length;
  const instTypes = { Pribadi: 0, Pemerintah: 0, Swasta: 0, Ormas: 0, Lainnya: 0 };
  statsEntries.forEach((entry: any) => {
    const type = entry.institutionType || entry.institution_type || "";
    if (type in instTypes) {
      instTypes[type as keyof typeof instTypes]++;
    } else {
      instTypes.Lainnya++;
    }
  });

  const officerCounts: Record<string, number> = {};
  statsEntries.forEach((entry: any) => {
    const officer = entry.intendedOfficer || entry.intended_officer || "Lainnya";
    officerCounts[officer] = (officerCounts[officer] || 0) + 1;
  });
  const sortedOfficers = Object.entries(officerCounts).sort((a, b) => b[1] - a[1]);
  const topOfficer = sortedOfficers[0]?.[0] || "-";

  const instNames: Record<string, number> = {};
  statsEntries.forEach((entry: any) => {
    const instName = entry.institutionName || entry.institution_name;
    if (instName) {
      instNames[instName] = (instNames[instName] || 0) + 1;
    }
  });

  const sortedInstNames = Object.entries(instNames).sort((a, b) => b[1] - a[1]);
  const topInstName = sortedInstNames[0]?.[0] || "-";

  const sortedInstTypes = Object.entries(instTypes).sort((a, b) => b[1] - a[1]);
  const topInstType = sortedInstTypes[0]?.[1] > 0 ? sortedInstTypes[0]?.[0] : "-";

  // Build Charts Data
  const barData = chartMetricType === "instansi"
    ? Object.entries(instTypes).map(([label, value]) => ({ label, value }))
    : sortedOfficers.length === 0 ? [{ label: "Tidak Ada", value: 0 }] : sortedOfficers.slice(0, 5).map(([label, value]) => ({ label, value }));

  const pieData = [
    { label: "Pribadi / Perorangan", value: instTypes.Pribadi, color: "#10b981" },
    { label: "Lembaga Pemerintah", value: instTypes.Pemerintah, color: "#3b82f6" },
    { label: "Perusahaan Swasta", value: instTypes.Swasta, color: "#f59e0b" },
    { label: "Ormas / Organisasi", value: instTypes.Ormas, color: "#ec4899" },
    { label: "Lainnya", value: instTypes.Lainnya, color: "#6b7280" }
  ].filter((d) => d.value > 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
        <button onClick={() => onSwitchTab("form")} className="hover:text-emerald-600 transition-colors">Buku Tamu</button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onSwitchTab("list")} className="hover:text-emerald-600 transition-colors">Daftar Tamu</button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onSwitchTab("stats")} className="text-emerald-600 font-bold flex items-center gap-1">Statistik Tamu 📊</button>
      </div>

      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">Statistik Kunjungan Tamu</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pilih tanggal kunjungan dan tipe grafik di bawah ini untuk melihat analisis data.</p>
      </div>

      {/* Filter Form Card */}
      <div className="relative z-30 mb-8 rounded-2xl border border-white/40 dark:border-slate-800 bg-white/40 dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md transition-colors duration-300">
        <form onSubmit={handleViewStats} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Skala Waktu Statistik</label>
            <div className="inline-flex rounded-xl bg-slate-100/80 dark:bg-slate-800/80 p-1 text-xs font-semibold h-[42px] items-center border border-slate-200/50 dark:border-slate-700/50">
              <button type="button" onClick={() => setStatsFilterType("harian")} className={`flex-1 h-full rounded-lg text-center transition-all ${statsFilterType === "harian" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}>Harian</button>
              <button type="button" onClick={() => setStatsFilterType("bulanan")} className={`flex-1 h-full rounded-lg text-center transition-all ${statsFilterType === "bulanan" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}>Bulanan</button>
            </div>
          </div>

          {statsFilterType === "harian" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Tanggal Kunjungan <span className="text-red-500">*</span></label>
              <ModernDatePicker value={statsDate} onChange={setStatsDate} required />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Bulan Kunjungan <span className="text-red-500">*</span></label>
              <ModernMonthPicker value={statsMonth} onChange={setStatsMonth} required />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Grafik <span className="text-red-500">*</span></label>
            <div className="flex rounded-xl bg-slate-100/80 dark:bg-slate-800/80 p-1 text-xs font-semibold h-[42px] items-center border border-slate-200/50 dark:border-slate-700/50 w-full">
              <button type="button" onClick={() => setStatsChartType("batang")} className={`flex-1 h-full rounded-lg flex items-center justify-center gap-1.5 transition-all ${statsChartType === "batang" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}><BarChart3 className="h-3.5 w-3.5" />Batang</button>
              <button type="button" onClick={() => setStatsChartType("lingkaran")} className={`flex-1 h-full rounded-lg flex items-center justify-center gap-1.5 transition-all ${statsChartType === "lingkaran" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}><PieChartIcon className="h-3.5 w-3.5" />Lingkaran</button>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300">Lihat Analisis 📊</Button>
          </div>
        </form>
      </div>

      {showChart && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="text-center md:text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-4 py-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/50 inline-block">
              {lastViewedFilterType === "harian" ? `Daftar Tamu Tanggal ${formatDateHeading(lastViewedDate)}` : `Daftar Tamu Bulan ${formatMonthHeading(lastViewedMonth)}`}
            </h3>
          </div>

          {totalStatsTamu === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 p-8 backdrop-blur-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"><Calendar className="h-8 w-8" /></div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Tidak Ada Data Kunjungan</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {lastViewedFilterType === "harian" ? `Belum ada tamu yang terdaftar pada tanggal ${formatDateHeading(lastViewedDate)}.` : `Belum ada tamu yang terdaftar pada bulan ${formatMonthHeading(lastViewedMonth)}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center md:justify-start">
                <div className="rounded-2xl border border-white/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md flex items-center gap-4 w-full max-w-sm transition-colors duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"><Users className="h-6 w-6" /></div>
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">{totalStatsTamu}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengunjung</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/40 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 shadow-xl dark:shadow-none backdrop-blur-xl transition-colors duration-300">
                {lastViewedChartType === "batang" ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />Diagram Batang Kunjungan</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kuantitas kunjungan tamu berdasarkan pengelompokan tertentu.</p>
                      </div>
                      <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold self-start sm:self-auto border border-slate-200/50 dark:border-slate-700/50">
                        <button type="button" onClick={() => setChartMetricType("instansi")} className={`rounded-md px-3 py-1.5 transition-all ${chartMetricType === "instansi" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}>Jenis Instansi</button>
                        <button type="button" onClick={() => setChartMetricType("pejabat")} className={`rounded-md px-3 py-1.5 transition-all ${chartMetricType === "pejabat" ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}>Pejabat Dituju</button>
                      </div>
                    </div>
                    <BarChart data={barData} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />Diagram Lingkaran Kunjungan</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Persentase sebaran jenis instansi asal dari tamu yang berkunjung.</p>
                    </div>
                    <DonutChart data={pieData} totalValue={totalStatsTamu} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
