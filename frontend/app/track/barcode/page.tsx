import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeTrackPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/track"
      title="Lacak Permohonan Layanan"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/track"
      backLabel="Kembali ke Lacak Layanan"
      scanText="Scan untuk Melacak Permohonan"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk melacak status permohonan layanan PTSP Kemenag Barito Utara."
      downloadFilename="barcode-track-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/track"
    />
  );
}
