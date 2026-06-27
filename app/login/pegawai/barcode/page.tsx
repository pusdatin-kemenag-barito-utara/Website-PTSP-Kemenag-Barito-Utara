import { BarcodeDisplay } from "@/components/barcode/barcode-display";

export default function BarcodeLoginPegawaiPage() {
  return (
    <BarcodeDisplay
      qrUrl="https://ptsp.kemenag-baritoutara.com/login/pegawai"
      title="Masuk Pegawai"
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/login/pegawai"
      backLabel="Kembali ke Login Pegawai"
      scanText="Scan untuk Masuk Pegawai"
      description="Arahkan kamera HP Anda ke QR Code di atas untuk masuk ke akun pegawai PTSP Kemenag Barito Utara."
      downloadFilename="barcode-login-pegawai-ptsp-kemenag.png"
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl="https://ptsp.kemenag-baritoutara.com/login/pegawai"
    />
  );
}
