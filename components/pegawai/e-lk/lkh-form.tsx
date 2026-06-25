"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { createLaporanKinerjaAction, updateLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";

export function LkhForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(initialData?.tanggal || new Date().toISOString().split("T")[0]);
  const [kegiatan, setKegiatan] = useState(initialData?.kegiatanTugasJabatan || "");
  const [hasil, setHasil] = useState(initialData?.hasil || "");
  const [buktiUrl, setBuktiUrl] = useState(initialData?.buktiDukungUrl || "");

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
        buktiDukungUrl: buktiUrl || undefined,
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
    <div className="max-w-2xl border border-slate-200 shadow-sm overflow-hidden bg-white rounded-3xl">
      <div className="p-0">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <Field label="Tanggal Kegiatan" required>
            <div className="w-full md:w-1/2">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-slate-400 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 focus:shadow-md focus:shadow-emerald-500/5 min-h-[100px] resize-y"
            />
          </Field>

          <Field label="Kuantitas/Output (Hasil)" required hint="Tuliskan jumlah hasil dari kegiatan tersebut">
            <Input 
              type="text" 
              value={hasil}
              onChange={(e) => setHasil(e.target.value)}
              placeholder="Contoh: 1 Dokumen, 5 Lembar, dll."
              required
            />
          </Field>

          <Field label="Link Bukti Dukung (Opsional)" hint="Masukkan link Google Drive atau tautan dokumen bukti kerja jika ada">
            <Input 
              type="url" 
              value={buktiUrl}
              onChange={(e) => setBuktiUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={loading}
              className="border-slate-200 text-slate-600 font-bold"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Menyimpan..." : "Simpan LKH"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
