import { notFound } from "next/navigation";
import { updateServiceAction } from "@/lib/actions/admin-master";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  
  const service = await prisma.services.findUnique({
    where: { id: BigInt(id) },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Layanan</h1>
        <p className="mt-2 text-slate-600">Perbarui data layanan.</p>
      </div>

      <Card>
        <form action={updateServiceAction} className="space-y-4">
          <input type="hidden" name="id" value={service.id.toString()} />
          <Field label="Nama Layanan" required>
            <Input name="name" defaultValue={service.name} required />
          </Field>
          <Field label="Slug" required>
            <Input name="slug" defaultValue={service.slug} />
          </Field>
          <Field label="Deskripsi">
            <Textarea
              name="description"
              defaultValue={service.description || ""}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={service.is_active || false}
            />
            Aktif
          </label>
          <Button>Simpan Perubahan</Button>
        </form>
      </Card>
    </div>
  );
}
