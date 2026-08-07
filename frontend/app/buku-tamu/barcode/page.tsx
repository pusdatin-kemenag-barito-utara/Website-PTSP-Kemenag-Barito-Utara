import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeBukuTamuPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/buku-tamu"
      title="Buku Tamu Elektronik"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/buku-tamu"
      backLabel="Kembali ke Buku Tamu"
      scanText="Scan untuk Mengisi Buku Tamu"
      description="Arahkan kamera HP Anda ke QR Code di atas secara mandiri, aman, dan mudah."
      downloadFilename="barcode-buku-tamu-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/buku-tamu"
    />
  );
}

