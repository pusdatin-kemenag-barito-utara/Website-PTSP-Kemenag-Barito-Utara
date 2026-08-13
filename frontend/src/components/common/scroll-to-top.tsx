import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-[9990] pointer-events-auto"
        >
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold text-[12px] border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
            title="Kembali ke atas halaman"
            aria-label="Ke atas halaman"
          >
            <ChevronUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform duration-200 stroke-[2.5]" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold text-[12px] tracking-tight">Ke atas</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
