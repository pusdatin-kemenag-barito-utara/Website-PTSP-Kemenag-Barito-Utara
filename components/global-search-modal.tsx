"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, LayoutGrid, FileSearch, HelpCircle, ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        // Opening logic is handled in the parent component
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setTimeout(() => setQuery(""), 200);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Default action on enter is searching services
    router.push(`/layanan?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const quickLinks = [
    { label: "Katalog Layanan Masyarakat", href: "/layanan", icon: LayoutGrid, desc: "Cari & ajukan layanan publik" },
    { label: "Katalog Layanan Pegawai", href: "/layanan-pegawai", icon: LayoutGrid, desc: "Layanan khusus ASN & Pegawai" },
    { label: "Lacak Pengajuan", href: "/track", icon: FileSearch, desc: "Cek status permohonan" },
    { label: "Buku Tamu", href: "/buku-tamu", icon: BookOpen, desc: "Isi buku tamu online" },
    { label: "E-Pengaduan", href: "/e-pengaduan", icon: HelpCircle, desc: "Sampaikan pengaduan" },
  ];

  const filteredLinks = quickLinks.filter(link => 
    link.label.toLowerCase().includes(query.toLowerCase()) || 
    link.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Search Input Area */}
            <form onSubmit={handleSearch} className="relative border-b border-slate-100 dark:border-slate-800">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari layanan, informasi, atau lacak tiket..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent py-5 pl-14 pr-14 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-base sm:text-lg font-medium"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Tutup</span>
              </button>
            </form>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-900/50">
              {query.trim() && (
                <div className="mb-6 space-y-1">
                  <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Hasil Pencarian
                  </h3>
                  
                  <Link
                    href={`/layanan?q=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Cari Layanan "{query}"
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Telusuri katalog layanan PTSP
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                  
                  <Link
                    href={`/track?q=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                      <FileSearch className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Lacak Tiket "{query}"
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cari status pengajuan berdasarkan nomor tiket
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {query.trim() ? "Halaman Terkait" : "Tautan Cepat"}
                </h3>
                
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 group transition-colors shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-slate-700 group-hover:text-emerald-600 transition-colors">
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {link.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {link.desc}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Tidak ada halaman yang cocok dengan pencarian ini.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="hidden sm:flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Gunakan</span>
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-sans shadow-sm text-[10px] font-bold">
                  Enter
                </kbd>
                <span>untuk mencari</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Tutup</span>
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-sans shadow-sm text-[10px] font-bold">
                  ESC
                </kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
