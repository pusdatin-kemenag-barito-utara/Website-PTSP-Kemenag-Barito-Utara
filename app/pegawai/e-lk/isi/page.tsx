import { LkhForm } from "@/components/pegawai/e-lk/lkh-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { laporanKinerja } from "@/lib/db/schema/kepegawaian";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FormInput, FileCheck2 } from "lucide-react";

export default async function IsiLkhPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await searchParams;
  let initialData = null;

  if (id && typeof id === "string") {
    const existing = await db
      .select()
      .from(laporanKinerja)
      .where(and(eq(laporanKinerja.id, id), eq(laporanKinerja.userId, user.id)))
      .limit(1);

    if (existing.length > 0) {
      initialData = existing[0];
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Ringkas Minimalis */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-3 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 mb-2">
          <FormInput className="h-3.5 w-3.5" />
          <span>{initialData ? "Edit Laporan Kinerja" : "Input Laporan Kinerja Harian"}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {initialData ? "Ubah Laporan Kinerja Harian" : "Isi Laporan Kinerja Harian"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
          {initialData
            ? "Ubah data laporan kinerja Anda sebelum diproses oleh atasan."
            : "Catat kegiatan tugas jabatan yang Anda laksanakan hari ini beserta hasilnya."}
        </p>
      </div>

      <LkhForm initialData={initialData} />
    </div>
  );
}
