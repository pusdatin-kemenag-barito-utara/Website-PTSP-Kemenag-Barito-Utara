import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModernSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
}

export interface ModernSelectProps {
  options: (ModernSelectOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  searchable?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  size?: "sm" | "md";
  align?: "left" | "right";
}

export function ModernSelect({
  options,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Pilih opsi...",
  icon: Icon,
  name,
  id,
  disabled = false,
  required = false,
  error,
  className,
  triggerClassName,
  menuClassName,
  searchable,
  enableSearch,
  searchPlaceholder = "Cari pilihan...",
  clearable = false,
  size = "sm",
  align = "left",
}: ModernSelectProps) {
  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined ? value : defaultValue
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync controlled value if provided
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const currentValue = value !== undefined ? value : internalValue;

  // Normalize options (supports both string[] and ModernSelectOption[])
  const baseOptions: ModernSelectOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  // If currentValue exists and is not present in baseOptions, include it so it's always visible and selected
  const normalizedOptions = useMemo(() => {
    if (
      currentValue &&
      !baseOptions.some(
        (opt) =>
          opt.value === currentValue ||
          opt.value.toLowerCase() === currentValue.toLowerCase() ||
          opt.label.toLowerCase() === currentValue.toLowerCase()
      )
    ) {
      return [{ value: currentValue, label: currentValue }, ...baseOptions];
    }
    return baseOptions;
  }, [baseOptions, currentValue]);

  const selectedOption = normalizedOptions.find(
    (opt) =>
      opt.value === currentValue ||
      (currentValue &&
        (opt.value.toLowerCase() === currentValue.toLowerCase() ||
          opt.label.toLowerCase() === currentValue.toLowerCase()))
  );

  // Should we show search? Default to true if options > 7, or if enableSearch/searchable is configured
  const showSearch =
    enableSearch !== undefined
      ? enableSearch
      : searchable !== undefined
      ? searchable
      : normalizedOptions.length > 7;

  // Filter options based on search query
  const filteredOptions = searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  // Calculate and update menu position in Portal
  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Auto-detect whether to open upwards or downwards
    // Threshold is 240px (approx height of dropdown list)
    const shouldOpenUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    setPlacement(shouldOpenUp ? "top" : "bottom");

    // Calculate maximum available height so the menu never extends beyond the viewport
    const availableHeight = shouldOpenUp
      ? Math.max(160, spaceAbove - 16)
      : Math.max(160, spaceBelow - 16);

    const style: React.CSSProperties = {
      position: "fixed",
      width: rect.width,
      minWidth: Math.max(rect.width, 200),
      maxWidth: "calc(100vw - 2rem)",
      maxHeight: availableHeight,
      zIndex: 99999,
    };

    if (shouldOpenUp) {
      style.bottom = window.innerHeight - rect.top + 6;
    } else {
      style.top = rect.bottom + 6;
    }

    if (align === "right") {
      style.right = window.innerWidth - rect.right;
    } else {
      style.left = rect.left;
    }

    setMenuStyle(style);
  };

  // Keep position synced with trigger button on scroll or window resize
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = (e: Event) => {
      // Ignore scroll events originating from inside the dropdown menu itself
      if (
        menuRef.current &&
        e.target instanceof Node &&
        menuRef.current.contains(e.target)
      ) {
        return;
      }

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // If trigger button is scrolled completely out of view, close the dropdown
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }
      updateCoords();
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, align]);

  // Click outside to close (checks both trigger button container and portal menu)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, showSearch]);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect("");
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block w-full text-left", className)}
    >
      {/* Hidden input for native form submission compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={currentValue}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id ? `${id}-btn` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white text-left transition-all duration-150 outline-none cursor-pointer select-none",
          size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-3.5 text-xs font-medium",
          "hover:border-slate-300 hover:bg-slate-50/50",
          isOpen && "border-[#059669] ring-2 ring-[#059669]/15 shadow-xs bg-white",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/10",
          disabled && "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && (
            <Icon
              className={cn(
                "shrink-0 text-slate-400",
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
              )}
            />
          )}

          {selectedOption ? (
            <span className="font-semibold text-slate-800 truncate">
              {selectedOption.label}
            </span>
          ) : currentValue ? (
            <span className="font-semibold text-slate-800 truncate">
              {currentValue}
            </span>
          ) : (
            <span className="text-slate-400 truncate font-normal">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {clearable && currentValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition-colors"
              title="Hapus pilihan"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "text-slate-400 transition-transform duration-200",
              size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
              isOpen && "rotate-180 text-[#059669]"
            )}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu Rendered via Portal */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                style={menuStyle}
                initial={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn(
                  "rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col",
                  menuClassName
                )}
              >
                {/* Search Input inside Popover */}
                {showSearch && (
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 text-slate-800 placeholder:text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 text-slate-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* List of Options */}
                <div
                  className="flex-1 min-h-0 overflow-y-auto p-1 space-y-0.5 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => {
                      const isSelected = opt.value === currentValue;
                      const OptIcon = opt.icon;

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => handleSelect(opt.value)}
                          className={cn(
                            "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer",
                            isSelected
                              ? "bg-emerald-50 text-emerald-800 font-bold"
                              : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium",
                            opt.disabled && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {OptIcon && (
                              <OptIcon
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  isSelected ? "text-[#059669]" : "text-slate-400"
                                )}
                              />
                            )}
                            <span className="leading-snug break-words whitespace-normal">{opt.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {opt.badge !== undefined && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 text-[10px] rounded-md font-bold tracking-wide shrink-0",
                                  isSelected
                                    ? "bg-emerald-100 text-emerald-800"
                                    : String(opt.badge).toUpperCase() === "ASN"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : String(opt.badge).toLowerCase().includes("masyarakat")
                                    ? "bg-sky-50 text-sky-700 border border-sky-200/60"
                                    : "bg-slate-100 text-slate-500"
                                )}
                              >
                                {opt.badge}
                              </span>
                            )}
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-6 text-center text-xs text-slate-400 italic">
                      Tidak ada hasil ditemukan
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
