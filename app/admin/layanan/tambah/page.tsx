import Link from "next/link";
import { createServiceAction } from "@/lib/actions/admin-master";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ArrowLeft, PlusCircle } from "lucide-react";

export default async function AddServicePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/layanan"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1f4bb7] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar layanan
      </Link>

      <PageHeader
        title="Tambah Layanan"
        description="Buat layanan utama baru untuk PTSP."
        icon={PlusCircle}
      />

      <Card>
        <form action={createServiceAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Layanan" required>
              <Input name="name" required placeholder="Masukkan nama layanan" />
            </Field>
            <Field
              label="Slug"
              hint="Boleh dikosongkan. Sistem akan membuat slug dari nama."
            >
              <Input name="slug" placeholder="contoh: layanan-nikah" />
            </Field>
          </div>
          <Field label="Deskripsi">
            <Textarea
              name="description"
              placeholder="Deskripsi singkat tentang layanan ini..."
            />
          </Field>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-[#1f4bb7] focus:ring-[#1f4bb7]/20"
              />
              Aktifkan layanan
            </label>
            <Button>Simpan Layanan</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
