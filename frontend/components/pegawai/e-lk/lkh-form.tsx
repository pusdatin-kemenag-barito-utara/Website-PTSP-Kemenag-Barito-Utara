"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { createLaporanKinerjaAction, updateLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { Loader2, Save, X, CheckCircle2 } from "lucide-react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";

export function LkhForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(initialData?.tanggal || new Date().toISOString().split("T")[0]);
  const [kegiatan, setKegiatan] = useState(initialData?.kegiatanTugasJabatan || "");
  const [hasil, setHasil] = useState(initialData?.hasil || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kegiatan || !hasil) {
      toast.error("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);
    
    try {
      const data = {
        tanggal,
        kegiatanTugasJabatan: kegiatan,
        hasil,
      };

      const res = initialData?.id 
        ? await updateLaporanKinerjaAction(initialData.id, data)
        : await createLaporanKinerjaAction(data);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(initialData?.id ? "LKH berhasil diubah!" : "LKH berhasil disimpan!");
        router.push("/pegawai/e-lk/harian");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl transition-colors">
      <div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          <Field label="Tanggal Kegiatan" required>
            <div className="w-full sm:w-1/2">
              <ModernDatePicker 
                value={tanggal} 
                onChange={(val) => setTanggal(val)} 
                required
                name="tanggal"
              />
            </div>
          </Field>

          <Field label="Kegiatan Tugas Jabatan" required hint="Deskripsikan kegiatan yang Anda lakukan hari ini">
            <textarea 
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              placeholder="Contoh: Menyusun laporan keuangan bulan Mei..."
              required
              className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-xs placeholder:text-slate-400 transition-all duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[110px] resize-y"
            />
          </Field>

          <Field label="Kuantitas/Output (Hasil)" required hint="Tuliskan jumlah hasil dari kegiatan tersebut">
            <Input 
              type="text" 
              value={hasil}
              onChange={(e) => setHasil(e.target.value)}
              placeholder="Contoh: 1 Dokumen, 5 Lembar, dll."
              required
              className="h-12 rounded-2xl text-xs sm:text-sm font-semibold"
            />
          </Field>

          {/* Tombol Aksi Batal & Simpan dengan Ikon & Animasi */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={loading}
              className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 gap-2"
            >
              <X className="h-4 w-4 text-slate-400" />
              <span>Batal</span>
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 border-0"
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4.5 w-4.5" />
              )}
              <span>{loading ? "Menyimpan LKH..." : "Simpan LKH"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
