import { BarcodeDisplay } from "@/components/barcode/barcode-display";
import { getServiceBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BarcodeLayananSlugPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  return (
    <BarcodeDisplay
      qrUrl={`https://ptsp.kemenag-baritoutara.com/layanan/${slug}`}
      title={service.name}
      subtitle="PTSP Kemenag Barito Utara"
      backHref="/layanan"
      backLabel="Kembali ke Layanan"
      scanText="Scan untuk Melihat Detail Layanan"
      description={`Arahkan kamera HP Anda ke QR Code di atas untuk melihat detail layanan ${service.name} PTSP Kemenag Barito Utara.`}
      downloadFilename={`barcode-layanan-${slug}-ptsp-kemenag.png`}
      footerTitle="Pelayanan Terpadu Satu Pintu (PTSP)"
      footerSubtitle="Kementerian Agama Kabupaten Barito Utara"
      footerUrl={`https://ptsp.kemenag-baritoutara.com/layanan/${slug}`}
    />
  );
}
