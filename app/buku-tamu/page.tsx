import { db, serializeBigInt } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { systemStatus } from "@/lib/db/schema/logs";
import { eq, desc } from "drizzle-orm";
import PageBanner from "@/components/common/PageBanner";
import GuestBookClient from "./_components/guest-book-client";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // Real-time data loading without caching

export const metadata: Metadata = {
  title: "Buku Tamu Elektronik",
  description: "Daftar kunjungan tamu dan publik ke Kantor Kementerian Agama Kabupaten Barito Utara.",
};

export default async function GuestBookPage() {
  let entries: any[] = [];
  try {
    const rawEntries = await db
      .select()
      .from(guestBook)
      .orderBy(desc(guestBook.visitDate));
    entries = serializeBigInt(rawEntries) || [];
  } catch (err) {
    console.error("Failed to query guestBook:", err);
  }
  
  let allowManualGuestBookDate = false;
  try {
    const statusRecord = await db.query.systemStatus.findFirst({
      where: eq(systemStatus.id, "heartbeat"),
    });
    allowManualGuestBookDate = statusRecord?.notes === "MANUAL_GUESTBOOK_ON";
  } catch (err) {
    console.error("Failed to query systemStatus:", err);
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 pb-16">
      <PageBanner
        title="Buku Tamu Elektronik"
        description="Selamat datang di Kantor Kementerian Agama Kabupaten Barito Utara. Silakan isi daftar kunjungan Anda di bawah ini secara mandiri, aman, dan mudah."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Buku Tamu" },
        ]}
        eyebrow="PTSP KEMENAG BARITO UTARA"
      />
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8">
        <GuestBookClient initialEntries={entries} isManualMode={allowManualGuestBookDate} />
      </div>
      <RealtimeSync />
    </main>
  );
}
