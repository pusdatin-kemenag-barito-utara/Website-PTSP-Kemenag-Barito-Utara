"use client";

import { useState } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import { GuestBookClientProps } from "./types";
import GuestBookForm from "./guest-book-form";
import GuestBookList from "./guest-book-list";
import GuestBookStats from "./guest-book-stats";

export default function GuestBookClient({ initialEntries, isManualMode = false }: GuestBookClientProps) {
  const [activeTab, setActiveTab] = useState<"form" | "list" | "stats">("form");
  const [entries, setEntries] = useState(initialEntries);

  const todayStr = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Sleek Tab Navigation with Emerald Glow */}
      <div className="flex justify-center w-full px-2 sm:px-0">
        <div className="flex w-full max-w-lg sm:w-auto rounded-xl bg-slate-100 p-1 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "form"
                ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0" />
            <span className="hidden sm:inline">Isi Buku Tamu</span>
            <span className="sm:hidden">Isi Form</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "list"
                ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
            <span className="hidden sm:inline">Daftar Kunjungan</span>
            <span className="sm:hidden">Daftar</span>
            <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800">
              {entries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "stats"
                ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0" />
            <span className="hidden sm:inline">Statistik Kunjungan</span>
            <span className="sm:hidden">Statistik</span>
          </button>
        </div>
      </div>

      {/* Main Glassmorphism Display Box */}
      <div className="relative isolate rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
        {/* Glow accent wrapper to prevent overflow scrollbars while keeping dropdowns unclipped */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-teal-500/10 blur-[100px]" />
        </div>

        {activeTab === "form" && (
          <GuestBookForm
            onSuccess={(newEntry) => {
              setEntries((prev) => [newEntry, ...prev]);
              setActiveTab("list");
            }}
            isManualMode={isManualMode}
          />
        )}

        {activeTab === "list" && (
          <GuestBookList
            entries={entries}
            statsDate={todayStr}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === "stats" && (
          <GuestBookStats
            entries={entries}
            onSwitchTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}
