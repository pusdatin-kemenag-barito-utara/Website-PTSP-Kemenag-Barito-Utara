"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, X, LucideIcon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface ModernSelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface ModernSelectProps {
  options: string[] | ModernSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: LucideIcon;
  enableSearch?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
}

export function ModernSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  icon: Icon,
  enableSearch = false,
  required,
  name,
  id,
  disabled = false,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device to prevent auto-focus keyboard popup
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    ) || (typeof window !== "undefined" && window.innerWidth < 768);
  }, []);

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

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

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleOpen = () => {
    if (disabled) return;
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    // Only focus search on desktop — skip on mobile to avoid keyboard popup
    if (nextOpen && enableSearch && !isMobile()) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef} id={id}>
      <input
        type="text"
        name={name}
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        className="absolute w-px h-px opacity-0 -z-10 left-1/2 top-1/2 pointer-events-none"
        onFocus={(e) => {
          // Blur immediately if somehow focused, but allow reportValidity tooltip to show
          e.target.blur();
        }}
      />

      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center justify-between gap-3 w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          isOpen ? "border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/20 bg-white dark:bg-slate-800" : "hover:border-slate-300 dark:hover:border-slate-600"
        } ${disabled ? "opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""}`}
      >
        {(() => {
          const ActiveIcon = selectedOption?.icon || Icon;
          return ActiveIcon ? (
            <ActiveIcon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isOpen ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-500"
              }`}
            />
          ) : null;
        })()}
        <span
          className={`flex-1 text-left text-xs font-semibold leading-snug break-words ${
            value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? "text-emerald-500 rotate-180" : "group-hover:text-slate-500"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            {enableSearch && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 ml-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  inputMode={isMobile() ? "none" : "text"}
                  readOnly={isMobile()}
                  value={searchQuery}
                  onChange={(e) => !isMobile() && setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent border-0 px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors mr-1"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-72 overflow-y-auto p-2 pb-6 pr-3 space-y-0.5 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  const OptionIcon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30"
                          : "text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                    >
                      {OptionIcon && (
                        <OptionIcon
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? "text-white" : "text-emerald-600"
                          }`}
                        />
                      )}
                      <span className="flex-1 break-words leading-snug">{opt.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-xs font-semibold text-slate-400 text-center">
                  Opsi tidak ditemukan
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
