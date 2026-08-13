import React, { useState, useRef, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";

interface ModernTimePickerProps {
  value: string; // HH:MM
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  name?: string;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30"
];

export function ModernTimePicker({
  value,
  onChange,
  label,
  required,
  name,
}: ModernTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTime = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
          {label}
        </label>
      )}

      {/* Hidden input for form integration */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Styled Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all cursor-pointer ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Clock
          className={`h-4.5 w-4.5 transition-colors ${isOpen ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-500"}`}
        />
        <span
          className={`flex-1 font-semibold text-left ${value ? "text-slate-800" : "text-slate-400"}`}
        >
          {value ? `${value} WIB` : "Pilih Jam"}
        </span>
        {value && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-slate-400" />
          </div>
        )}
      </button>

      {/* Simplified, Compact Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-2 w-[290px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                Pilih Jam Bertamu
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Grid Content */}
            <div className="p-3">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Jam Kunjungan (Senin - Jumat)
              </p>
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))", 
                  gap: "6px" 
                }}
              >
                {TIME_SLOTS.map((slot) => {
                  const isSelected = value === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSelectTime(slot)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100 scale-105"
                          : "border-slate-100 bg-slate-50 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-semibold tracking-wide">
                Waktu Indonesia Barat (WIB)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-[9px] font-black text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
