import { LkhForm } from "@/components/pegawai/e-lk/lkh-form";
import { getCurrentUser } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
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
    try {
      const res = await fetchAPI<any>(`/pegawai/lkh?userId=${user.id}`);
      const lkhList = res?.data || [];
      initialData = lkhList.find((item: any) => item.id === id) || null;
    } catch {
      initialData = null;
    }
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
          {initialData ? (
            <FileCheck2 className="h-6 w-6" />
          ) : (
            <FormInput className="h-6 w-6" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Laporan Kinerja Harian" : "Isi Laporan Kinerja Harian"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catat aktivitas kerja harian Anda untuk penilaian kinerja bulanan.
          </p>
        </div>
      </div>

      <LkhForm initialData={initialData} />
    </div>
  );
}
