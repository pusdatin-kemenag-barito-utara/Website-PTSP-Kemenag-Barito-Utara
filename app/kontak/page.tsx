import { ContactInfoCards } from "@/components/contact/contact-info-cards";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ContactFaq } from "@/components/contact/contact-faq";
import PageBanner from "@/components/common/PageBanner";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      <PageBanner
        title="Hubungi Kami"
        description="Silakan hubungi kami untuk pertanyaan terkait pengajuan layanan, dokumen persyaratan, atau kendala teknis pada portal PTSP. Kami siap melayani Anda sepenuh hati."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Kontak" },
        ]}
        eyebrow="LAYANAN BANTUAN & SUPPORT"
      />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8">
        <div className="mx-auto w-full space-y-8">
          <ContactInfoCards />
          <ContactChannels />
          <ContactFaq />
        </div>
      </div>
    </main>
  );
}
