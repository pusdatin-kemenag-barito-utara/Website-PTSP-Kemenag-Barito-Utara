import { BukuTamuClient } from "@/components/admin/buku-tamu/buku-tamu-client";

export function BukuTamuView({
  entries,
  allowManualGuestBookDate,
}: {
  entries: any[];
  allowManualGuestBookDate: boolean;
}) {
  return (
    <div className="space-y-4 pb-6">
      <BukuTamuClient initialEntries={entries} initialAllowManual={allowManualGuestBookDate} />
    </div>
  );
}

export default BukuTamuView;
