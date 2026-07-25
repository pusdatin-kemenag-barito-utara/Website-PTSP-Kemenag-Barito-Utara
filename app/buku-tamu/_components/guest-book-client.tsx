"use client";

import { useState } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import { GuestBookClientProps } from "./types";
import GuestBookForm from "./guest-book-form";
import GuestBookList from "./guest-book-list";
import GuestBookStats from "./guest-book-stats";
import {
  GuestBookSuccessModal,
  GuestBookSuccessModalData,
} from "./guest-book-success-modal";

import { m, AnimatePresence } from "framer-motion";

export default function GuestBookClient({ initialEntries, isManualMode = false }: GuestBookClientProps) {
  const [activeTab, setActiveTab] = useState<"form" | "list" | "stats">("form");
  const [entries, setEntries] = useState(initialEntries);
  const [successData, setSuccessData] = useState<GuestBookSuccessModalData | null>(null);

  const todayStr = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="w-full space-y-6">
      {/* Sleek Tab Navigation with Emerald Glow */}
      <div className="flex justify-center w-full px-2 sm:px-0">
        <div className="flex w-full max-w-full overflow-x-auto sm:overflow-visible sm:w-auto rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 shadow-inner backdrop-blur-md hide-scrollbar border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "form"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0" />
            <span className="hidden sm:inline">Isi Buku Tamu</span>
            <span className="sm:hidden">Isi Form</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "list"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
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
            <span className="ml-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {entries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "stats"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/10"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0" />
            <span className="hidden sm:inline">Statistik Kunjungan</span>
            <span className="sm:hidden">Statistik</span>
          </button>
        </div>
      </div>

      {/* Main Glassmorphism Display Box */}
      <div className="relative isolate rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 shadow-2xl dark:shadow-none backdrop-blur-xl sm:p-8 md:p-10 overflow-hidden transition-colors duration-300">
        {/* Glow accent wrapper to prevent overflow scrollbars while keeping dropdowns unclipped */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[100px]" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-teal-500/10 dark:bg-teal-500/20 blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "form" && (
              <GuestBookForm
                onSuccess={(newEntry, modalData) => {
                  setEntries((prev) => [newEntry, ...prev]);
                  setSuccessData(modalData);
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
          </m.div>
        </AnimatePresence>
      </div>

      {/* Floating Success Modal */}
      <GuestBookSuccessModal
        data={successData}
        onClose={() => {
          setSuccessData(null);
          setActiveTab("list");
        }}
      />
    </div>
  );
}
