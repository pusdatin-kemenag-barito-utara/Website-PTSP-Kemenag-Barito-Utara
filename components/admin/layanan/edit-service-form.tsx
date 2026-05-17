"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateServiceAction } from "@/lib/actions/admin/admin-master";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function EditServiceForm({ service }: { service: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateServiceAction(formData);
      if (result.success) {
        toast.success("Berhasil Memperbarui", {
          description: result.message || "Layanan telah diperbarui.",
        });
        router.push("/admin/layanan");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal memperbarui layanan.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="p-6 space-y-5">
      <input type="hidden" name="id" value={service.id.toString()} />
      <Field label="Nama Layanan" required>
        <Input 
          name="name" 
          defaultValue={service.name} 
          required 
          placeholder="Contoh: Pelayanan Pendidik dan Tenaga Kependidikan"
        />
      </Field>
      <Field label="Slug URL" hint="Slug di-generate otomatis jika dikosongkan.">
        <Input name="slug" defaultValue={service.slug} placeholder="slug-layanan" />
      </Field>
      <Field label="Deskripsi">
        <Textarea
          name="description"
          defaultValue={service.description || ""}
          placeholder="Tuliskan deskripsi singkat layanan ini..."
          className="min-h-[100px]"
        />
      </Field>
      <div className="pt-2">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={service.isActive}
              className="peer sr-only"
            />
            <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Status Aktif</p>
            <p className="text-[11px] text-slate-500">
              Layanan akan muncul dan bisa diakses di halaman beranda.
            </p>
          </div>
        </label>
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
