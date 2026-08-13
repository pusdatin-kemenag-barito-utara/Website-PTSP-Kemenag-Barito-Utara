import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, FileSpreadsheet } from "lucide-react";
import { importCutiCsvAction } from "@/lib/actions/admin/data-cuti";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportCutiModal({ open, onOpenChange, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleImport() {
    if (!file) {
      toast.error("Pilih file CSV terlebih dahulu.");
      return;
    }

    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.set("file", file);

    const res = await importCutiCsvAction(fd);
    setLoading(false);

    if (res.success) {
      setResult(res.message || "Import berhasil.");
      toast.success(res.message);
      onSuccess();
    } else {
      setResult(res.error);
      toast.error(res.error);
    }
  }

  function handleClose() {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Import CSV Data Cuti</h2>
          <button type="button" onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Unggah file CSV berformat sama dengan template Daftar Jumlah Cuti Pegawai ASN.
        </p>

        {!result && (
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm text-slate-500">Klik untuk pilih file CSV</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {result && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {result}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Tutup
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !file}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? "Mengimport..." : "Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
