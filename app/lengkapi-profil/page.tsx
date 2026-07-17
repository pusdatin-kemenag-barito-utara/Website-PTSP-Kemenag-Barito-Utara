import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import Link from "next/link";

import { signOutAction } from "@/lib/actions/auth/sign-out";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Lengkapi Profil Pemohon | PTSP Kemenag Barito Utara",
};

export default async function LengkapiProfilPage() {
  const profile = await requireAuth(true);

  if (!profile) {
    redirect("/login/pemohon");
  }

  if (profile.fullName && profile.phone && profile.address) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-[#020817] overflow-hidden font-sans transition-colors duration-500">
      
      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
        <form action={signOutAction.bind(null, "/login/pemohon")}>
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </button>
        </form>
      </div>
      {/* Modern Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-300/20 dark:bg-yellow-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-teal-400/20 dark:bg-teal-700/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
        {/* Subtle Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-10 opacity-40"></div>
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block hover:scale-105 transition-transform duration-500"
          >
            <div className="flex justify-center items-center h-20 w-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-emerald-900/10 dark:shadow-emerald-900/30 p-3 mx-auto mb-4 border border-white/50 dark:border-white/10 relative overflow-hidden backdrop-blur-sm group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-white/10 dark:from-emerald-900/20 dark:to-slate-800/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src="/kemenag-192.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain drop-shadow-md relative z-10"
              />
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm font-sans mb-2">
            Satu Langkah Lagi
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-sm font-medium px-4 leading-relaxed max-w-[400px] mx-auto">
            Halo{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md mx-1">
              {profile.email}
            </span>
            <span className="mt-1 inline-block">Silakan lengkapi profil Anda.</span>
          </p>
        </div>

        {/* Premium Glassmorphic Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-6 relative overflow-hidden border border-white/60 dark:border-white/10">
          {/* Subtle top border glow inside card */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

          <CompleteProfileForm
            initialName={profile.fullName || ""}
            initialPhone={profile.phone || ""}
          />
        </div>

        <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-600 mt-10 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} PTSP Kemenag Barito Utara
        </p>
      </div>
    </div>
  );
}
