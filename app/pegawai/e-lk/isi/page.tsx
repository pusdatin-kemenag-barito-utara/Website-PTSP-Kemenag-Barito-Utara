import { LkhForm } from "@/components/pegawai/e-lk/lkh-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { laporanKinerja } from "@/lib/db/schema/kepegawaian";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {initialData ? "Ubah Laporan Kinerja Harian" : "Isi Laporan Kinerja Harian"}
        </h1>
        <p className="text-slate-500 mt-1">
          {initialData 
            ? "Ubah data laporan kinerja Anda sebelum diproses oleh atasan." 
            : "Catat kegiatan tugas jabatan yang Anda laksanakan hari ini beserta hasilnya."}
        </p>
      </div>

      <LkhForm initialData={initialData} />
    </div>
  );
}
