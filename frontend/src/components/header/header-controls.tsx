import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function HeaderControls() {
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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-teal-300" />
        )}
      </button>
    </div>
  );
}
