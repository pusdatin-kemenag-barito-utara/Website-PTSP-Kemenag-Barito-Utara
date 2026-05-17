import { requireAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/user/profile-form";

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
        <ProfileForm profile={profile} />
      </Card>
    </div>
  );
}
