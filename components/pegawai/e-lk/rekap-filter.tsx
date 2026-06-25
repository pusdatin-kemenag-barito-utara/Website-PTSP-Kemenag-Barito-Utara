"use client";

import { useState } from "react";
import { ModernSelect } from "@/components/ui/modern-select";
import { Button } from "@/components/ui/button";
import { Calendar, Search } from "lucide-react";
import { m } from "framer-motion";

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
    <form className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 w-full sm:w-auto">
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
      <m.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full sm:w-auto"
      >
        <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 px-6 rounded-xl gap-2 font-bold h-11">
          <Search className="h-4 w-4" /> Filter
        </Button>
      </m.div>
    </form>
  );
}
