import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeEPengaduanPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://pengaduan.kemenag-baritoutara.com"
      title="E-Pengaduan & Saran"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/"
      backLabel="Kembali ke Beranda"
      scanText="Scan untuk Menyampaikan Pengaduan"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk mengakses layanan E-Pengaduan Kemenag Barito Utara."
      downloadFilename="barcode-e-pengaduan-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://pengaduan.kemenag-baritoutara.com"
    />
  );
}
