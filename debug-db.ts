import { db } from "./lib/db/index.js";
import { profiles } from "./lib/db/schema/auth.js";
import { eq, like } from "drizzle-orm";

async function main() {
  const allPegawai = await db.query.profiles.findMany({
    where: like(profiles.email, "%@pegawai.barut.kemenag.go.id"),
  });
  console.log(`Found ${allPegawai.length} users with pegawai email.`);
  
  const roleCounts: Record<string, number> = {};
  allPegawai.forEach(p => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });
  console.log("Roles distribution:", roleCounts);

  // Check if we can update one
  if (allPegawai.length > 0) {
    try {
      console.log("Attempting to update one user to role: pegawai...");
      await db.update(profiles).set({ role: "pegawai" }).where(eq(profiles.id, allPegawai[0].id));
      console.log("Update successful!");
    } catch (e: any) {
      console.error("Update failed:", e.message || e);
    }
  }
  
  process.exit(0);
}

main();
