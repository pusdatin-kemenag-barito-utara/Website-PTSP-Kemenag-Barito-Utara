import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeLayananPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/layanan"
      title="Katalog Jenis Layanan"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/layanan"
      backLabel="Kembali ke Layanan"
      scanText="Scan untuk Melihat Layanan"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk melihat katalog layanan PTSP Kemenag Barito Utara."
      downloadFilename="barcode-layanan-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/layanan"
    />
  );
}
