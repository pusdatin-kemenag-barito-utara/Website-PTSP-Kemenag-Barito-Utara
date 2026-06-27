import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeLoginPemohonPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/login/pemohon"
      title="Masuk Pemohon"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/login/pemohon"
      backLabel="Kembali ke Login Pemohon"
      scanText="Scan untuk Masuk Pemohon"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk masuk ke akun pemohon layanan PTSP Kemenag Barito Utara."
      downloadFilename="barcode-login-pemohon-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/login/pemohon"
    />
  );
}
