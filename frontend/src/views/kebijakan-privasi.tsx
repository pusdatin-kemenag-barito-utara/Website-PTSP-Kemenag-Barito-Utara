import PageBanner from "@/components/common/PageBanner";
import Link from "@/lib/next-compat/link";
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Share2,
  Chrome,
  FileText,
  HelpCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "1. Pendahuluan & Komitmen Privasi",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Kantor Kementerian Agama Kabupaten Barito Utara berkomitmen penuh untuk melindungi privasi dan keamanan data pribadi masyarakat pengguna layanan Pelayanan Terpadu Satu Pintu (PTSP) Online. Kebijakan Privasi ini menjelaskan prinsip pengumpulan, penggunaan, pengelolaan, dan perlindungan informasi Anda di portal resmi <strong className="text-slate-800">ptsp.kemenag-baritoutara.com</strong>.
      </p>
    ),
  },
  {
    icon: Database,
    title: "2. Pengumpulan Informasi Pribadi",
    content: (
      <div className="space-y-3 text-slate-600 text-sm sm:text-base">
        <p className="leading-relaxed">
          Kami mengumpulkan data pribadi yang Anda berikan secara sah dan sukarela saat melakukan pendaftaran akun pemohon maupun pengajuan berkas administrasi layanan. Data tersebut meliputi:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {[
            "Nama Lengkap Pemohon",
            "Nomor Telepon / WhatsApp Aktif",
            "Alamat Lengkap Domisili",
            "Alamat Email (jika login Google)",
            "Dokumen & Berkas Persyaratan",
            "Status & Riwayat Permohonan",
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100 font-medium text-slate-700 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: UserCheck,
    title: "3. Penggunaan Informasi",
    content: (
      <div className="space-y-3 text-slate-600 text-sm sm:text-base">
        <p className="leading-relaxed">
          Informasi yang terkumpul digunakan secara ketat hanya untuk kepentingan operasional dan verifikasi pelayanan publik PTSP, antara lain:
        </p>
        <div className="space-y-2 pt-1">
          {[
            "Memproses verifikasi berkas dan penerbitan dokumen administrasi keagamaan.",
            "Mengirimkan notifikasi perkembangan status pengajuan permohonan Anda.",
            "Berkomunikasi langsung via WhatsApp/HP apabila terdapat kekurangan berkas.",
            "Pelaporan statistik internal dan pengarsipan resmi Kementerian Agama.",
          ].map((text, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Lock,
    title: "4. Keamanan Data & Infrastruktur",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Kami menerapkan standar enkripsi teknis modern pada basis data Supabase (Database RLS & SSL) serta arsitektur cloud terlindungi untuk mencegah akses tanpa izin, manipulasi, kebocoran, atau penyalahgunaan data pribadi pemohon oleh pihak tak bertanggung jawab.
      </p>
    ),
  },
  {
    icon: Share2,
    title: "5. Perlindungan Pihak Ketiga",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Kementerian Agama Kabupaten Barito Utara <strong className="text-slate-900">TIDAK PERNAH</strong> menjual, menyewakan, memperjualbelikan, atau mendistribusikan data pribadi Anda kepada pihak mana pun untuk keperluan komersial atau promosi. Data Anda hanya dikelola oleh petugas internal yang berwenang.
      </p>
    ),
  },
  {
    icon: Chrome,
    title: "6. Integrasi Google OAuth",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Jika Anda menggunakan fitur <em>"Masuk dengan Google"</em>, sistem hanya mengambil identitas dasar profil publik (nama dan email) untuk pembuatan akun cepat. Kami tidak memiliki akses ke password akun Google pribadi Anda.
      </p>
    ),
  },
];

export function KebijakanPrivasiView() {
  return (
    <>
      <PageBanner
        title="Kebijakan Privasi"
        description="Komitmen dan jaminan keandalan perlindungan data pribadi pemohon PTSP Kemenag Barito Utara."
      />

      <div className="min-h-screen bg-slate-50/50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
          {/* Main Content Sections */}
          <div className="space-y-6">
            {sections.map((sec, idx) => {
              const IconComp = sec.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4"
                >
                  <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                  {sec.content}
                </div>
              );
            })}
          </div>

          {/* Footer Card Info */}
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                <span>Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">Punya Pertanyaan Mengenai Data Anda?</h3>
              <p className="text-emerald-100/80 text-xs sm:text-sm font-medium max-w-lg leading-relaxed">
                Tim PTSP Kemenag Barito Utara siap membantu menjelaskan tata cara dan hak perlindungan data Anda.
              </p>
            </div>

            <Link
              href="/kontak"
              className="shrink-0 inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-extrabold text-emerald-950 shadow-lg hover:bg-emerald-50 transition-all hover:scale-105"
            >
              <HelpCircle className="h-4.5 w-4.5 text-emerald-700" />
              <span>Hubungi Kami</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default KebijakanPrivasiView;