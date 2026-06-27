import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodePage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com"
      title="PTSP Kemenag Barito Utara"
      subtitle="Pelayanan Terpadu Satu Pintu"
      backHref="/"
      backLabel="Kembali ke Beranda"
      scanText="Scan untuk Mengakses Layanan PTSP"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk mengakses layanan PTSP Kemenag Barito Utara."
      downloadFilename="barcode-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com"
    />
  );
}
