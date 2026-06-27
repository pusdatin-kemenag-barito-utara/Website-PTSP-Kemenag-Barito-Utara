import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./lib/db";
import { services } from "./lib/db/schema";
import { sql, eq } from "drizzle-orm";

async function main() {
  const result = await db.select({ id: services.id, name: services.name, category: services.category }).from(services);
  console.log("Services:");
  result.forEach(r => console.log(`${r.id} | ${r.name} | ${r.category}`));
  
  // Update the categories for internal services
  const internalNames = [
    "Permohonan Cuti ASN",
    "Permohonan Izin Belajar / Tugas Belajar",
    "Permohonan Pemberhentian / Pengunduran Diri",
    "Permohonan Tunjangan Keluarga (KP4)",
    "Layanan Sub Bagian Tata Usaha"
  ];
  
  console.log("Updating internal services...");
  for (const name of internalNames) {
    await db.update(services).set({ category: "internal" }).where(eq(services.name, name));
  }
  
  console.log("Done updating!");
  process.exit(0);
}

main().catch(console.error);
