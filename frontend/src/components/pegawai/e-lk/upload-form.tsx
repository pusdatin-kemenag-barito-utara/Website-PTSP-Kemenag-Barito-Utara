import { useState } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { uploadFinalLkhAction } from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { Loader2, UploadCloud, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { motion as m } from "framer-motion";

export function UploadFinalForm({ 
  currentMonth, 
  currentYear,
  existingData
}: { 
  currentMonth: number;
  currentYear: number;
  existingData: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(existingData?.dokumenUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      toast.error("URL dokumen final wajib diisi.");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(fileUrl);
      if (!fileUrl.includes("drive.google.com") && !fileUrl.includes("docs.google.com")) {
        toast.warning("Tautan sepertinya bukan dari Google Drive, namun tetap disimpan.");
      }
    } catch (_) {
      toast.error("Format tautan (URL) tidak valid. Harap sertakan awalan http:// atau https://");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("month", String(currentMonth));
      formData.append("year", String(currentYear));
      formData.append("fileUrl", fileUrl);
      const res = await uploadFinalLkhAction(formData);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Dokumen final LKH berhasil diunggah!");
        router.refresh();
      }
    } catch (err: any) {

      toast.error(err.message || "Terjadi kesalahan saat mengunggah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl border border-slate-200 shadow-sm overflow-hidden bg-white rounded-3xl">
      <div className="p-0">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-6">
          <Field label="Tautan Dokumen Final (PDF)" required hint="Unggah file PDF rekapan LKH yang sudah Anda tandatangani ke Google Drive, lalu tempelkan linknya di sini.">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="h-4.5 w-4.5" />
              </div>
              <Input 
                type="url" 
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="pl-10 h-12 text-sm md:text-base border-slate-300 focus:border-emerald-500 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                required
                disabled={loading}
              />
              {fileUrl && fileUrl.startsWith("http") && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
          </Field>

          <div className="pt-5 sm:pt-6 border-t border-slate-100 flex items-center justify-end">
            <m.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-lg shadow-emerald-500/25 px-6 h-12 sm:h-11 rounded-xl text-[15px] sm:text-sm transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" /> : <UploadCloud className="h-5 w-5 sm:h-4 sm:w-4" />}
                {loading ? "Mengunggah..." : (existingData ? "Perbarui Dokumen" : "Unggah Dokumen")}
              </Button>
            </m.div>
          </div>
        </form>
      </div>
    </div>
  );
}
