import { ContactHeader } from "@/components/contact/contact-header";
import { ContactInfoCards } from "@/components/contact/contact-info-cards";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ContactFaq } from "@/components/contact/contact-faq";

export default function ContactPage() {
  return (
    <div className="w-full overflow-hidden">
      <ContactHeader />

      {/* Main Content */}
      <section className="relative -mt-16 mb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full space-y-8">
          <ContactInfoCards />
          <ContactChannels />
          <ContactFaq />
        </div>
      </section>
    </div>
  );
}
