import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import Link from "next/link";

export const metadata = {
  title: "Lengkapi Profil Pemohon | PTSP Kemenag Barito Utara",
};

export default async function LengkapiProfilPage() {
  // Panggil requireAuth dengan parameter allowIncomplete = true
  const profile = await requireAuth(true);

  if (!profile) {
    redirect("/login/pemohon");
  }

  // Jika profil sudah lengkap (bukan null), langsung lempar ke dashboard
  if (profile.fullName && profile.phone && profile.address) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-600 to-slate-50 opacity-90"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-teal-500/20 blur-[80px]"></div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center items-center h-20 w-20 bg-white rounded-2xl shadow-xl shadow-emerald-900/10 p-3 mx-auto mb-4 border border-emerald-100">
              <img
                src="/images/logo-kemenag.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Satu Langkah Lagi</h1>
          <p className="text-slate-600 text-sm mt-2 font-medium px-4">
            Halo <span className="font-bold text-emerald-700">{profile.email}</span>,<br />
            Silakan lengkapi profil Anda sebelum mengakses layanan PTSP.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 pt-9 relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-50"></div>
          
          <CompleteProfileForm 
            initialName={profile.fullName || ""}
            initialPhone={profile.phone || ""}
          />
        </div>

        <p className="text-center text-xs font-semibold text-slate-500 mt-8 tracking-wide">
          &copy; {new Date().getFullYear()} KANTOR KEMENTERIAN AGAMA
          <br />KABUPATEN BARITO UTARA
        </p>
      </div>
    </div>
  );
}
