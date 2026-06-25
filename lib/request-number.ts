import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { services as servicesTable } from "@/lib/db/schema/services";

/**
 * Ambil kode layanan dari database secara dinamis berdasarkan nama service.
 * Prefix (PUB/ASN) diderivasi dari kolom `category`:
 *   - "asn" → prefix "ASN"
 *   - lainnya → prefix "PUB"
 * Kode 3 huruf diambil dari kolom `request_code`.
 * Jika request_code belum diset, fallback ke "PTG" (petugas/umum).
 */
async function getServiceCodeInfo(
  serviceName: string
): Promise<{ prefix: "PUB" | "ASN"; code: string }> {
  const service = await db.query.services.findFirst({
    where: eq(servicesTable.name, serviceName),
    columns: { category: true, requestCode: true },
  });

  const prefix: "PUB" | "ASN" =
    service?.category === "asn" ? "ASN" : "PUB";
  const code = service?.requestCode?.toUpperCase() || "PTG";

  return { prefix, code };
}

/**
 * Generate nomor pengajuan berikutnya.
 * Format: [PREFIX]-[CODE]-[YEAR]-[NNNNNN]
 * Contoh: ASN-CUT-2026-000001 atau PUB-MDR-2026-000012
 *
 * Sistem ini mendaur ulang nomor dari pengajuan yang dihapus
 * (sebelum selesai/disetujui) agar nomor urut tidak terbuang.
 */
export async function generateRequestNumber(
  serviceName: string,
  year?: number
): Promise<string> {
  const { prefix, code } = await getServiceCodeInfo(serviceName);
  const currentYear = year ?? new Date().getFullYear();
  const serviceCode = `${prefix}-${code}`;

  // 1. Cek recycled numbers — ambil nomor terkecil yang tersedia
  const recycled = await db.execute(sql`
    DELETE FROM kemenag_ptsp.ptsp_recycled_numbers
    WHERE id = (
      SELECT id FROM kemenag_ptsp.ptsp_recycled_numbers
      WHERE service_code = ${serviceCode} AND year = ${currentYear}
      ORDER BY seq_number ASC
      LIMIT 1
    )
    RETURNING seq_number
  `);

  let seqNumber: number;

  if (recycled.rows.length > 0) {
    // Gunakan nomor daur ulang
    seqNumber = Number((recycled.rows[0] as any).seq_number);
  } else {
    // 2. Tidak ada daur ulang — increment sequence
    const result = await db.execute(sql`
      INSERT INTO kemenag_ptsp.ptsp_request_number_sequences (service_code, year, last_seq)
      VALUES (${serviceCode}, ${currentYear}, 1)
      ON CONFLICT (service_code, year)
      DO UPDATE SET last_seq = ptsp_request_number_sequences.last_seq + 1
      RETURNING last_seq
    `);
    seqNumber = Number((result.rows[0] as any).last_seq);
  }

  // Format: 6 digit dengan leading zero
  const formatted = String(seqNumber).padStart(6, "0");
  return `${serviceCode}-${currentYear}-${formatted}`;
}

/**
 * Kembalikan nomor pengajuan ke pool daur ulang ketika pengajuan dihapus
 * (hanya untuk status yang belum final: submitted, under_review, revision_required)
 */
export async function recycleRequestNumber(requestNumber: string): Promise<void> {
  // Format: ASN-CUT-2026-000001 → parts: ["ASN", "CUT", "2026", "000001"]
  const parts = requestNumber.split("-");
  if (parts.length !== 4) {
    // Nomor lama format TEMP-xxx, abaikan saja
    return;
  }

  const [prefixPart, codePart, yearStr, seqStr] = parts;
  const year = parseInt(yearStr, 10);
  const seqNumber = parseInt(seqStr, 10);

  if (isNaN(year) || isNaN(seqNumber)) return;

  const serviceCode = `${prefixPart}-${codePart}`;

  await db.execute(sql`
    INSERT INTO kemenag_ptsp.ptsp_recycled_numbers (service_code, year, seq_number)
    VALUES (${serviceCode}, ${year}, ${seqNumber})
    ON CONFLICT (service_code, year, seq_number) DO NOTHING
  `);
}
