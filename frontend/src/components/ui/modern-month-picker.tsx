import React, { useState, useRef, useEffect } from "react";
import { format, addYears, subYears, isSameMonth } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";

interface ModernMonthPickerProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  name?: string;
}

export function ModernMonthPicker({
  value,
  onChange,
  label,
  required,
  name,
}: ModernMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYearDate, setCurrentYearDate] = useState(
    value ? new Date(`${value}-01`) : new Date(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  const selectedDate = value ? new Date(`${value}-01`) : null;

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(currentYearDate.getFullYear(), monthIndex, 1);
    const formattedMonth = format(newDate, "yyyy-MM");
    onChange(formattedMonth);
    setIsOpen(false);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentYearDate(subYears(currentYearDate, 1))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-slate-900">
          {format(currentYearDate, "yyyy", { locale: id })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentYearDate(addYears(currentYearDate, 1))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const renderMonths = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      return new Date(currentYearDate.getFullYear(), i, 1);
    });

    return (
      <div className="grid grid-cols-3 gap-2 px-2 pb-2">
        {months.map((monthDate, i) => {
          const isSelected = selectedDate && isSameMonth(monthDate, selectedDate);
          
          return (
            <div
              key={i}
              onClick={() => handleMonthClick(i)}
              className={`h-10 flex items-center justify-center text-xs font-bold rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#059669] text-white shadow-lg shadow-emerald-200 scale-105"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              {format(monthDate, "MMM", { locale: id })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
          {label}
        </label>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all cursor-pointer ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <CalendarIcon
          className={`h-4 w-4 transition-colors ${isOpen ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-500"}`}
        />
        <span
          className={`flex-1 font-semibold text-left ${value ? "text-slate-900" : "text-slate-400"}`}
        >
          {value
            ? format(new Date(`${value}-01`), "MMMM yyyy", { locale: id })
            : "Pilih Bulan"}
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

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {renderHeader()}
            <div className="p-2">
              {renderMonths()}

              <div className="mt-2 p-2 border-t border-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    onChange(format(today, "yyyy-MM"));
                    setCurrentYearDate(today);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
