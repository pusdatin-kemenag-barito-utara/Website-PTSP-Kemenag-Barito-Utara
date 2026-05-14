import { requireAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { updateProfileAction } from "@/lib/actions/user";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const profile = await requireAuth();

  return (
    <div className="space-y-5 md:space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#059669] to-[#0f8a54]"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#059669]">
            👤 Pengaturan Akun
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Profil Saya
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base max-w-xl">
            Perbarui data pribadi Anda untuk memastikan semua informasi pada
            dokumen layanan nantinya akurat.
          </p>
        </div>
      </section>

      <Card className="border-slate-200 p-2 sm:p-4">
        <form action={updateProfileAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nama Lengkap" required>
              <Input
                name="full_name"
                defaultValue={profile.full_name || ""}
                required
                className="h-12"
              />
            </Field>

            <Field label="Nomor Telepon / WhatsApp" required>
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                required
                className="h-12"
              />
            </Field>
          </div>

          <Field label="Alamat Lengkap" required>
            <Textarea
              name="address"
              defaultValue={profile.address || ""}
              required
              className="min-h-[120px] resize-none"
            />
          </Field>

          {/* Dummy Email Field - Visually Hidden or clearly labeled as ID */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <Field
              label="ID Sistem Internal (Otomatis)"
              hint="ID unik ini dibuat oleh sistem untuk keperluan pendaftaran, tidak perlu diubah."
            >
              <Input
                value={profile.email || ""}
                readOnly
                className="bg-slate-100/50 text-slate-500 font-mono text-sm border-slate-200"
                disabled
              />
            </Field>
          </div>

          <div className="pt-2">
            <Button className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-500/25 transition-all">
              Simpan Perubahan Profil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
