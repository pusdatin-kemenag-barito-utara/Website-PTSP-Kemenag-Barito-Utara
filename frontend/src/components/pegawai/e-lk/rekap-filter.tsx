import { useState } from "react";
import { ModernSelect } from "@/components/ui/modern-select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function RekapFilter({ initialMonth, initialYear }: { initialMonth: number, initialYear: number }) {
  const [month, setMonth] = useState(initialMonth.toString());
  const [year, setYear] = useState(initialYear.toString());

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const monthOptions = monthNames.map((m, i) => ({
    value: (i + 1).toString(),
    label: m
  }));

  const yearOptions = [2024, 2025, 2026, 2027].map(y => ({
    value: y.toString(),
    label: y.toString()
  }));

  return (
    <form className="flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto transition-all">
      <div className="w-full sm:w-44">
        <ModernSelect
          name="month"
          value={month}
          onChange={setMonth}
          options={monthOptions}
          icon={Calendar}
          placeholder="Pilih Bulan"
        />
      </div>
      <div className="w-full sm:w-32">
        <ModernSelect
          name="year"
          value={year}
          onChange={setYear}
          options={yearOptions}
          placeholder="Pilih Tahun"
        />
      </div>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full sm:w-auto"
      >
        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-md shadow-emerald-500/20 px-5 rounded-2xl gap-2 h-11 transition-all border-0 cursor-pointer"
        >
          <Filter className="h-4 w-4" />
          <span>Terapkan Filter</span>
        </Button>
      </motion.div>
    </form>
  );
}
