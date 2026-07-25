import { requireAuth } from "@/lib/auth";
import { ProfileForm } from "@/components/user/profile-form";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const profile = await requireAuth();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Premium Glassmorphic Header */}
      <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/80 p-6 sm:p-8 md:p-10 text-white shadow-xl dark:shadow-none border border-emerald-800/50 dark:border-slate-800 transition-colors duration-300">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3.5 py-1 backdrop-blur-md">
            <User className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
              Pengaturan Akun Pemohon
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Profil Saya
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-100/80 dark:text-slate-300 leading-relaxed max-w-xl">
            Perbarui data pribadi Anda untuk memastikan semua informasi pada dokumen layanan nantinya akurat dan terverifikasi.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 shadow-xs transition-colors">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
