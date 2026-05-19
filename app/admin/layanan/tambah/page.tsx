import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { AddServiceForm } from "@/components/admin/layanan/add-service-form";

export default async function AddServicePage() {
  await requirePermission("layanan");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/layanan"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#059669] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar layanan
      </Link>

      <PageHeader
        title="Tambah Layanan"
        description="Buat layanan utama baru untuk PTSP."
        icon={PlusCircle}
      />

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <AddServiceForm />
      </Card>
    </div>
  );
}
