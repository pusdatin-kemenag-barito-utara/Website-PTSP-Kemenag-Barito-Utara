import PageBanner from "@/components/common/PageBanner";
import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi | PTSP Kemenag Barito Utara",
  description: "Kebijakan Privasi Pelayanan Terpadu Satu Pintu (PTSP) Kementerian Agama Kabupaten Barito Utara.",
};

export default function KebijakanPrivasiPage() {
  return (
    <>
      <PageBanner
        title="Kebijakan Privasi"
        description="Komitmen kami dalam melindungi data pribadi Anda"
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-emerald max-w-none">
          <h2>1. Pendahuluan</h2>
          <p>
            Kantor Kementerian Agama Kabupaten Barito Utara berkomitmen untuk melindungi privasi dan keamanan data pribadi pengguna layanan Pelayanan Terpadu Satu Pintu (PTSP) Online. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan situs web kami (ptsp.kemenag-baritoutara.com).
          </p>

          <h2>2. Pengumpulan Informasi</h2>
          <p>
            Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela saat mendaftar atau menggunakan layanan kami. Informasi ini meliputi:
          </p>
          <ul>
            <li>Nama Lengkap</li>
            <li>Alamat Email (termasuk data otentikasi dari akun Google Anda jika menggunakan fitur masuk dengan Google)</li>
            <li>Nomor Telepon / WhatsApp</li>
            <li>Alamat Domisili</li>
            <li>Dokumen pendukung yang Anda unggah untuk keperluan permohonan layanan</li>
          </ul>

          <h2>3. Penggunaan Informasi</h2>
          <p>
            Informasi yang kami kumpulkan digunakan secara eksklusif untuk tujuan administratif dan operasional PTSP, termasuk namun tidak terbatas pada:
          </p>
          <ul>
            <li>Memproses permohonan layanan yang Anda ajukan.</li>
            <li>Berkomunikasi dengan Anda mengenai status permohonan, jadwal janji temu, atau kendala operasional.</li>
            <li>Meningkatkan kualitas layanan publik kami.</li>
            <li>Keperluan pelaporan dan pengarsipan resmi Kementerian Agama.</li>
          </ul>

          <h2>4. Keamanan Data</h2>
          <p>
            Kami menerapkan standar keamanan teknis dan administratif yang ketat (seperti enkripsi pada tingkat database menggunakan teknologi Supabase) untuk mencegah akses tanpa izin, kehilangan, atau penyalahgunaan data pribadi Anda.
          </p>

          <h2>5. Berbagi Informasi Pihak Ketiga</h2>
          <p>
            Kami <strong>tidak akan pernah</strong> menjual, menyewakan, atau menukar informasi pribadi Anda kepada pihak ketiga untuk tujuan komersial. Data Anda hanya dapat diakses oleh petugas berwenang di lingkungan internal Kementerian Agama Kabupaten Barito Utara, dan hanya akan dibagikan jika diwajibkan oleh undang-undang atau hukum yang berlaku.
          </p>

          <h2>6. Login menggunakan Google (Google OAuth)</h2>
          <p>
            Jika Anda memilih untuk menggunakan fitur "Masuk dengan Google", kami akan menerima informasi dasar dari profil Google Anda (seperti alamat email dan nama lengkap) untuk membuat akun pada sistem kami secara otomatis. Kami tidak memiliki akses ke kata sandi Google Anda.
          </p>

          <h2>7. Perubahan Kebijakan</h2>
          <p>
            Kami berhak memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan yang signifikan akan diberitahukan melalui situs web kami atau melalui email kepada pengguna yang terdaftar.
          </p>

          <hr className="my-8" />
          <p className="text-slate-500 text-sm text-center">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
            Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami melalui menu <Link href="/kontak" className="text-emerald-600 font-medium hover:underline">Kontak</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
