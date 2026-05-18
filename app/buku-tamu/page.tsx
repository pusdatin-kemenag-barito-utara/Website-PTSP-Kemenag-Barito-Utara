import { db, serializeBigInt } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import PageBanner from "@/components/common/PageBanner";
import GuestBookClient from "./_components/guest-book-client";

export const revalidate = 0; // Real-time data loading without caching

export default async function GuestBookPage() {
  const rawEntries = await db
    .select()
    .from(guestBook)
    .orderBy(desc(guestBook.visitDate));

  const entries = serializeBigInt(rawEntries) || [];

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
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
        <GuestBookClient initialEntries={entries} />
      </div>
    </main>
  );
}
