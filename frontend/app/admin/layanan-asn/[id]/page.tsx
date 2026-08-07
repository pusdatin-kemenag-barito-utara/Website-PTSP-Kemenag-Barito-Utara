import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import Link from "next/link";

export default async function ServiceWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePermission("layanan");
  const isSuper = isSuperAdmin(profile.email);
  const { id } = await params;

  let service: any = null;
  try {
    const res = await fetchAPI<any>("/services");
    if (res && res.data && Array.isArray(res.data)) {
      service = res.data.find((s: any) => String(s.id) === String(id));
    }
  } catch (err) {
    console.error("Failed to fetch service ASN data from Golang API:", err);
  }

  if (!service) {
    notFound();
  }

  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (!isSuper && !isGeneralAdmin && service.roleOwner !== specificRole) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/layanan-asn"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Layanan
        </Link>
        <PageHeader
          title={`Kelola: ${service.name}`}
          description="Manajemen layanan ini diatur secara spesifik pada masing-masing bidang."
          icon={FolderOpen}
        />
      </div>

      <div className="bg-white rounded-3xl p-10 border border-slate-200/60 shadow-sm text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Sistem Hardcode Aktif</h3>
        <p className="text-slate-500 max-w-lg">
          Fitur pengaturan daftar item layanan dan field formulir untuk layanan pegawai (ASN) telah disembunyikan. 
          Pengaturan form dan item untuk layanan ini diimplementasikan secara langsung (<i>hardcode</i>) pada kode masing-masing bidang.
        </p>
      </div>
    </div>
  );
}
