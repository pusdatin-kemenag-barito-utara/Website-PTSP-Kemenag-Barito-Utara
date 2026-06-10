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
      {/* Background Decor - Kemenag Theme (Emerald & Gold) */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-emerald-800 to-emerald-600 opacity-95">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
      </div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/30 blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-yellow-400/10 blur-[80px]"></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block hover:scale-105 transition-transform duration-300"
          >
            <div className="flex justify-center items-center h-24 w-24 bg-white rounded-2xl shadow-xl shadow-emerald-900/20 p-4 mx-auto mb-5 border-2 border-emerald-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-white opacity-50"></div>
              <img
                src="/kemenag-192.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain drop-shadow-md relative z-10"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Satu Langkah Lagi
          </h1>
          <p className="text-emerald-50 text-sm mt-3 font-medium px-4 leading-relaxed">
            Halo{" "}
            <span className="font-bold text-yellow-300 drop-shadow-sm">
              {profile.email}
            </span>
            ,<br />
            Silakan lengkapi profil Anda sebelum mengakses layanan PTSP.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl shadow-emerald-900/10 rounded-[2rem] p-8 pt-9 relative overflow-hidden ring-1 ring-black/5">
          {/* Subtle top border glow */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-500 opacity-90"></div>

          <CompleteProfileForm
            initialName={profile.fullName || ""}
            initialPhone={profile.phone || ""}
          />
        </div>

        <p className="text-center text-xs font-semibold text-emerald-800/60 mt-8 tracking-wide">
          &copy; {new Date().getFullYear()} PTSP Kemenag Barito Utara
        </p>
      </div>
    </div>
  );
}
