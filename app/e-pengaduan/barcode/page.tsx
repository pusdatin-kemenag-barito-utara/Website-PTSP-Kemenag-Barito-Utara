import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeEPengaduanPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/e-pengaduan"
      title="E-Pengaduan & Saran"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/e-pengaduan"
      backLabel="Kembali ke E-Pengaduan"
      scanText="Scan untuk Menyampaikan Pengaduan"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk menyampaikan pengaduan atau saran ke PTSP Kemenag Barito Utara."
      downloadFilename="barcode-e-pengaduan-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/e-pengaduan"
    />
  );
}
