import PageBanner from "@/components/common/PageBanner";
import Link from "@/lib/next-compat/link";
import {
  FileCheck2,
  UserCheck,
  Building2,
  AlertTriangle,
  Globe,
  Scale,
  HelpCircle,
  CheckCircle2,
  Calendar,
  XCircle,
} from "lucide-react";

const sections = [
  {
    icon: FileCheck2,
    title: "1. Penerimaan & Ketentuan Umum",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Dengan mengakses, mendaftar, dan menggunakan portal Pelayanan Terpadu Satu Pintu (PTSP) Online Kantor Kementerian Agama Kabupaten Barito Utara, Anda secara hukum menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini.
      </p>
    ),
  },
  {
    icon: UserCheck,
    title: "2. Hak & Kewajiban Pemohon Layanan",
    content: (
      <div className="space-y-3 text-slate-600 text-sm sm:text-base">
        <p className="leading-relaxed font-medium text-slate-800">
          Sebagai pemohon masyarakat atau pegawai, Anda berkewajiban untuk:
        </p>
        <ul className="space-y-2.5 pt-1">
          {[
            "Memberikan informasi data diri dan berkas permohonan yang *benar, sah, akurat, dan dapat dipertanggungjawabkan*.",
            "Menjaga kerahasiaan kata sandi (password) akun dan tidak membagikannya kepada pihak tak berwenang.",
            "Tidak mengunggah dokumen palsu, manipulatif, atau berkas yang melanggar ketentuan hukum yang berlaku.",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 font-medium text-slate-700 text-xs sm:text-sm">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: Building2,
    title: "3. Hak & Wewenang Penyelenggara Layanan",
    content: (
      <div className="space-y-3 text-slate-600 text-sm sm:text-base">
        <p className="leading-relaxed">
          Kantor Kementerian Agama Kabupaten Barito Utara selaku penyelenggara pelayanan publik memiliki wewenang untuk:
        </p>
        <div className="space-y-2.5 pt-1">
          {[
            "Menolak atau membatalkan permohonan jika berkas dokumen tidak lengkap, tidak sah, atau tidak memenuhi SOP.",
            "Melakukan tindakan pembekuan akun jika terindikasi adanya kecurangan, pemalsuan data, atau penyalahgunaan sistem.",
            "Memproses setiap permohonan sesuai dengan Standar Pelayanan Minimal (SPM) dan SOP keagamaan yang ditetapkan.",
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
    icon: AlertTriangle,
    title: "4. Pemalsuan Dokumen & Sanksi Hukum",
    content: (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 sm:p-5 space-y-2 text-rose-950">
        <div className="flex items-center gap-2 font-bold text-rose-800 text-xs sm:text-sm">
          <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
          <span>Perhatian Khusus Pemalsuan Berkas</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-rose-900/90 font-medium">
          Segala bentuk pemalsuan dokumen permohonan (seperti Surat Keterangan, Sertifikat, rekomendasi, atau tanda tangan) merupakan pelanggaran hukum serius dan akan diproses sesuai dengan ketentuan Pasal Pemalsuan Surat dalam Hukum Pidana Indonesia.
        </p>
      </div>
    ),
  },
  {
    icon: Globe,
    title: "5. Batasan Tanggung Jawab Teknologi",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Sistem PTSP Online disediakan untuk mempermudah akses layanan. Kami tidak bertanggung jawab atas penundaan permohonan yang disebabkan oleh kesalahan pengisian oleh pemohon, kendala jaringan komunikasi lokal pemohon, atau kejadian di luar kendali teknis operasional (Force Majeure).
      </p>
    ),
  },
  {
    icon: Scale,
    title: "6. Hukum & Peraturan Yang Berlaku",
    content: (
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan Undang-Undang Republik Indonesia Nomor 25 Tahun 2009 tentang Pelayanan Publik serta peraturan teknis di lingkungan Kementerian Agama Republik Indonesia.
      </p>
    ),
  },
];

export function SyaratKetentuanView() {
  return (
    <>
      <PageBanner
        title="Syarat dan Ketentuan"
        description="Aturan dan pedoman penggunaan layanan administrasi PTSP Kemenag Barito Utara."
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
              <h3 className="text-xl sm:text-2xl font-black">Butuh Bantuan Lebih Lanjut?</h3>
              <p className="text-emerald-100/80 text-xs sm:text-sm font-medium max-w-lg leading-relaxed">
                Tim layanan PTSP Kemenag Barito Utara siap membantu dan memberikan panduan pengajuan berkas Anda.
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

export default SyaratKetentuanView;