import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderControlsProps {
  isLightHeader?: boolean;
}

export function HeaderControls({ isLightHeader = false }: HeaderControlsProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme (default to "light")
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center">
      {/* Icon Button Switcher Tema (Klik untuk ubah Terang / Gelap) */}
      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Mode Terang (Klik untuk Mode Gelap)" : "Mode Gelap (Klik untuk Mode Terang)"}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-xs transition-all active:scale-95 cursor-pointer ${
          isLightHeader
            ? "border-slate-200 dark:border-white/20 bg-slate-100/90 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200/90 dark:hover:bg-white/20"
            : "border-white/20 bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-teal-500 dark:text-teal-300" />
        )}
      </button>
    </div>
  );
}
