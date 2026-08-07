import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeLoginPemohonPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/login/masyarakat"
      title="Masuk Pemohon Masyarakat"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/login/masyarakat"
      backLabel="Kembali ke Login Masyarakat"
      scanText="Scan untuk Masuk Masyarakat"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk masuk ke akun pemohon layanan PTSP Kemenag Barito Utara."
      downloadFilename="barcode-login-masyarakat-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/login/masyarakat"
    />
  );
}
