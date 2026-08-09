import { fetchAPI } from "@/lib/api";
import PageBanner from "@/components/common/PageBanner";
import GuestBookClient from "./_components/guest-book-client";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buku Tamu Elektronik",
  description: "Daftar kunjungan tamu dan publik ke Kantor Kementerian Agama Kabupaten Barito Utara.",
};

export default async function GuestBookPage() {
  let entries: any[] = [];
  try {
    const res = await fetchAPI<any>("/guest-book");
    if (res && res.data && Array.isArray(res.data)) {
      entries = res.data;
    }
  } catch (err) {
    console.error("Failed to query guestBook from Golang API:", err);
  }

  let allowManualGuestBookDate = false;
  try {
    const sysRes = await fetchAPI<any>("/admin/system/status");
    if (sysRes && sysRes.data && typeof sysRes.data.allowManualGuestBook === "boolean") {
      allowManualGuestBookDate = sysRes.data.allowManualGuestBook;
    }
  } catch (sysErr) {
    console.error("Failed to query system status from Golang API:", sysErr);
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
