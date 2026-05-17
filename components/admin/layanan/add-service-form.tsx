"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createServiceAction } from "@/lib/actions/admin/admin-master";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AddServiceForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createServiceAction(formData);
      if (result.success) {
        toast.success("Berhasil Menambahkan", {
          description: result.message || "Layanan baru telah ditambahkan.",
        });
        router.push("/admin/layanan");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menambahkan layanan.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="p-6 space-y-5">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nama Layanan" required>
          <Input 
            name="name" 
            required 
            placeholder="Contoh: Pelayanan Pendidik dan Tenaga Kependidikan"
            className="font-medium"
          />
        </Field>
        <Field
          label="Slug URL"
          hint="Boleh dikosongkan. Sistem akan membuat slug dari nama."
        >
          <Input name="slug" placeholder="contoh: layanan-ptk" className="font-mono text-sm" />
        </Field>
      </div>
      <Field label="Deskripsi">
        <Textarea
          name="description"
          placeholder="Tuliskan deskripsi singkat tentang layanan ini..."
          className="min-h-[120px]"
        />
      </Field>
      <div className="pt-2">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="peer sr-only"
            />
            <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Aktifkan Layanan</p>
            <p className="text-[11px] text-slate-500">
              Layanan akan muncul dan bisa diakses di halaman beranda.
            </p>
          </div>
        </label>
      </div>
      <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4 mt-6 -mx-6 px-6 pb-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-6 rounded-xl"
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 rounded-xl font-bold shadow-lg shadow-emerald-600/10"
        >
          {isPending ? "Menyimpan..." : "Simpan Layanan"}
        </Button>
      </div>
    </form>
  );
}
