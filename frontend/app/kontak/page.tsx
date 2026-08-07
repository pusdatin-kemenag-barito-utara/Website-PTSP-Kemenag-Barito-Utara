import { ContactInfoCards } from "@/components/contact/contact-info-cards";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ContactFaq } from "@/components/contact/contact-faq";
import PageBanner from "@/components/common/PageBanner";
import { MotionDiv, fadeUpVariants, staggerContainerVariants } from "@/components/common/MotionDiv";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami & Pusat Bantuan",
  description: "Kontak resmi, jam operasional, alamat kantor, dan FAQ Pelayanan Terpadu Satu Pintu (PTSP) Kemenag Barito Utara.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 pb-16">
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
        <MotionDiv 
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mx-auto w-full space-y-8"
        >
          <MotionDiv variants={fadeUpVariants}>
            <ContactInfoCards />
          </MotionDiv>
          <MotionDiv variants={fadeUpVariants}>
            <ContactChannels />
          </MotionDiv>
          <MotionDiv variants={fadeUpVariants}>
            <ContactFaq />
          </MotionDiv>
        </MotionDiv>
      </div>
    </main>
  );
}
