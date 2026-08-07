import { Search } from "lucide-react";

export function TrackNotFound({ q }: { q: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
        <Search className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        Pengajuan Tidak Ditemukan
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
        Maaf, kami tidak dapat menemukan pengajuan dengan nomor{" "}
        <span className="font-bold text-slate-700">"{q}"</span>. Pastikan Anda
        memasukkan nomor pengajuan dengan benar.
      </p>
    </div>
  );
}
