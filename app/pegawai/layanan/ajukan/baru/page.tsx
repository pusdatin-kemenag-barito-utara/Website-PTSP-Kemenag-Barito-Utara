import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PegawaiUsulCutiForm } from "@/components/forms/pegawai/pegawai-usul-cuti-form";
import { getServiceCatalog } from "@/lib/queries";
import { requireAuth, getCurrentProfile } from "@/lib/auth";

export default async function PegawaiNewRequestPage() {
  await requireAuth();
  const catalog = await getServiceCatalog();
  const profile = await getCurrentProfile();

  return (
    <div className="w-full space-y-4">
      <div>
        <Link
          href="/pegawai/layanan/ajukan"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Layanan
        </Link>
      </div>

      <PegawaiUsulCutiForm 
        catalog={catalog} 
        profile={profile} 
        redirectPathPrefix="/pegawai/layanan/riwayat" 
      />
    </div>
  );
}
