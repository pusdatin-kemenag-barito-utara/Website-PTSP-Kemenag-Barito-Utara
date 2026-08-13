import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
  parse,
  isValid,
  addMonths,
  subMonths
} from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";

interface ModernMultiDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Component Props

export function ModernMultiDatePicker({
  value,
  onChange,
  label,
  placeholder = "Pilih Tanggal",
  required,
  name,
}: ModernMultiDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value string into sorted Date array
  const selectedDates = useMemo(() => {
    return (value || "")
      .split(",")
      .filter(Boolean)
      .map((d) => {
        const parsed = parse(d, "yyyy-MM-dd", new Date());
        parsed.setHours(0, 0, 0, 0);
        return parsed;
      })
      .filter((d) => isValid(d))
      .sort((a, b) => a.getTime() - b.getTime());
  }, [value]);

  const openPicker = () => {
    setView(startOfMonth(new Date()));
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
  };

  const togglePicker = () => {
    if (isOpen) {
      closePicker();
    } else {
      openPicker();
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closePicker();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Toggle a date on/off
  const handleDateToggle = useCallback((date: Date) => {
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const formattedDate = format(clickedDate, "yyyy-MM-dd");
    const dateStrings = (value || "").split(",").filter(Boolean);

    let nextDates: string[];
    if (dateStrings.includes(formattedDate)) {
      nextDates = dateStrings.filter((d) => d !== formattedDate);
    } else {
      nextDates = [...dateStrings, formattedDate];
    }
    nextDates.sort();
    onChange(nextDates.join(","));
  }, [value, onChange]);

  // Build calendar grid
  const calendarRows = useMemo(() => {
    const monthStart = startOfMonth(view);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);

    const rows: Date[][] = [];
    let week: Date[] = [];
    let day = gridStart;

    while (day <= gridEnd) {
      const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
      week.push(d);
      if (week.length === 7) {
        rows.push(week);
        week = [];
      }
      day = addDays(day, 1);
    }
    if (week.length > 0) rows.push(week);
    return rows;
  }, [view]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <input
        type="text"
        name={name}
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        className="absolute w-px h-px opacity-0 -z-10 left-1/2 top-1/2 pointer-events-none"
        onFocus={(e) => {
          e.target.blur();
        }}
      />

      {/* Trigger button */}
      <div
        onClick={togglePicker}
        className={`group flex items-center gap-3 w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border rounded-xl text-sm transition-all cursor-pointer ${
          isOpen
            ? "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/10 dark:ring-emerald-500/15"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        }`}
      >
        <div className={`transition-colors ${isOpen || selectedDates.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"}`}>
          <Calendar className="h-4 w-4 shrink-0" />
        </div>

        <div className="flex-1 flex flex-col justify-center min-w-0">
          <span className={`font-semibold text-sm truncate ${selectedDates.length > 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
            {selectedDates.length > 0
              ? selectedDates.length === 1
                ? format(selectedDates[0], "d MMMM yyyy", { locale: id })
                : `${format(selectedDates[0], "d MMM", { locale: id })} - ${format(selectedDates[selectedDates.length - 1], "d MMM yyyy", { locale: id })} (${selectedDates.length} Hari)`
              : placeholder}
          </span>
        </div>

        {value && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
            title="Hapus Semua"
          >
            <X className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[99] bg-black/20 sm:hidden" onClick={closePicker} />
      )}

      {/* Calendar popup */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="datepicker-popup"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[100] w-[90vw] max-w-[320px] sm:absolute sm:left-0 sm:translate-x-0 sm:bottom-full sm:mb-3 sm:w-[340px] sm:max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.preventDefault()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-50 dark:border-slate-700">
              <div
                role="button"
                onClick={(e) => { e.preventDefault(); setView(subMonths(view, 1)); }}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all focus:outline-none cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {format(view, "MMMM yyyy", { locale: id })}
                </span>
              </div>

              <div
                role="button"
                onClick={(e) => { e.preventDefault(); setView(addMonths(view, 1)); }}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all focus:outline-none cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2 px-2 mt-4">
              {DAY_NAMES.map((day, idx) => (
                <div
                  key={day}
                  className={`text-[11px] font-bold uppercase text-center py-2 ${idx === 0 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="pb-4 px-2">
              {calendarRows.map((week, wi) => (
                <div key={`week-${wi}`} className="grid grid-cols-7 gap-y-2 mb-2">
                  {week.map((currentDay) => {
                    const isSelected = selectedDates.some(d => isSameDay(d, currentDay));
                    const isCurrentMonth = isSameMonth(currentDay, view);
                    const isSunday = getDay(currentDay) === 0;

                    return (
                      <div key={format(currentDay, "yyyy-MM-dd")} className="flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDateToggle(currentDay);
                            if (!isCurrentMonth) {
                              setView(startOfMonth(currentDay));
                            }
                          }}
                          className={`
                            h-10 w-10 flex items-center justify-center text-[14px] font-bold cursor-pointer rounded-xl transition-all duration-200
                            ${!isCurrentMonth ? "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400" : ""}
                            ${isCurrentMonth && !isSelected && !isSunday ? "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700" : ""}
                            ${isCurrentMonth && !isSelected && isSunday ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" : ""}
                            ${isSelected ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : ""}
                          `}
                        >
                          {format(currentDay, "d")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-50 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {selectedDates.length} tanggal
              </span>

              <div
                role="button"
                onClick={(e) => { e.preventDefault(); closePicker(); }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none cursor-pointer"
              >
                Tutup
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
