import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PegawaiNewRequestForm } from "@/components/forms/pegawai-new-request-form";
import { getServiceCatalog } from "@/lib/queries";
import { requireAuth, getCurrentProfile } from "@/lib/auth";

export default async function PegawaiNewRequestPage() {
  await requireAuth();
  
  // Ambil semua layanan (catalog)
  // Atau jika ingin spesifik ASN, bisa filter. Di sini kita ambil semua yang aktif
  // tapi NewRequestForm sudah menghandle pemilihan service yang sesuai parameter URL
  const catalog = await getServiceCatalog();
  const profile = await getCurrentProfile();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/pegawai/layanan/ajukan"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Batal & Kembali
        </Link>
      </div>

      <PegawaiNewRequestForm 
        catalog={catalog} 
        profile={profile}
        redirectPathPrefix="/pegawai/layanan/riwayat" 
      />
    </div>
  );
}
