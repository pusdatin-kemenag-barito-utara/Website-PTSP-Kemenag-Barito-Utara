import PageBanner from "@/components/common/PageBanner";
import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan | PTSP Kemenag Barito Utara",
  description: "Syarat dan Ketentuan penggunaan layanan Pelayanan Terpadu Satu Pintu (PTSP) Kementerian Agama Kabupaten Barito Utara.",
};

export default function SyaratKetentuanPage() {
  return (
    <>
      <PageBanner
        title="Syarat dan Ketentuan"
        description="Aturan penggunaan layanan PTSP Online"
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-emerald max-w-none">
          <h2>1. Penerimaan Syarat</h2>
          <p>
            Dengan mengakses dan menggunakan portal Pelayanan Terpadu Satu Pintu (PTSP) Kementerian Agama Kabupaten Barito Utara, Anda menyatakan setuju untuk mematuhi semua syarat dan ketentuan yang tertulis di halaman ini. Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan layanan ini.
          </p>

          <h2>2. Hak dan Kewajiban Pengguna</h2>
          <ul>
            <li>Pengguna wajib memberikan informasi yang <strong>benar, akurat, dan dapat dipertanggungjawabkan</strong> saat mengisi formulir permohonan.</li>
            <li>Pengguna bertanggung jawab penuh atas keamanan akun dan kata sandi yang digunakan (jika ada).</li>
            <li>Pengguna dilarang mengunggah dokumen palsu, hasil rekayasa, atau dokumen yang melanggar hukum. Segala bentuk pemalsuan dokumen akan dilaporkan kepada pihak berwajib.</li>
          </ul>

          <h2>3. Hak dan Kewajiban Kemenag Barito Utara</h2>
          <ul>
            <li>Kami berhak menolak, membatalkan, atau menunda permohonan layanan jika ditemukan ketidaksesuaian data atau dokumen yang diunggah.</li>
            <li>Kami berkomitmen untuk memproses setiap permohonan sesuai dengan Standar Operasional Prosedur (SOP) dan jangka waktu yang telah ditetapkan.</li>
            <li>Kami berhak memblokir akun pengguna yang terbukti melakukan penyalahgunaan sistem atau pelanggaran berulang.</li>
          </ul>

          <h2>4. Batasan Tanggung Jawab</h2>
          <p>
            Layanan PTSP Online disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat:
          </p>
          <ul>
            <li>Gangguan koneksi internet dari sisi pengguna.</li>
            <li>Kesalahan input data oleh pengguna.</li>
            <li>Penundaan proses akibat hari libur nasional atau kendala teknis sistem di luar kendali kami.</li>
          </ul>

          <h2>5. Penggunaan Layanan Pihak Ketiga</h2>
          <p>
            Sistem ini menggunakan integrasi dengan layanan pihak ketiga seperti autentikasi Google dan infrastruktur Supabase. Kami tidak bertanggung jawab atas kebijakan privasi atau perubahan layanan yang dilakukan oleh pihak ketiga tersebut.
          </p>

          <h2>6. Hukum yang Berlaku</h2>
          <p>
            Syarat dan Ketentuan ini tunduk pada hukum dan peraturan perundang-undangan yang berlaku di Negara Kesatuan Republik Indonesia. Segala perselisihan akan diselesaikan secara musyawarah atau melalui jalur hukum yang berlaku.
          </p>

          <hr className="my-8" />
          <p className="text-slate-500 text-sm text-center">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
            Untuk bantuan dan pelaporan, silakan menuju halaman <Link href="/kontak" className="text-emerald-600 font-medium hover:underline">Kontak</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
