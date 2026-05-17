import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./lib/db";
import { services as servicesTable } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const id = 3;
  console.log("Querying for ID:", id);
  const serviceData = await db.query.services.findFirst({
    where: eq(servicesTable.id, BigInt(id)),
    with: {
      serviceItems: {
        with: {
          serviceFormFields: true,
          serviceRequirements: true,
        },
      },
    },
  });

  console.log("Result:", serviceData ? "FOUND" : "NOT FOUND");
  if (serviceData) {
    console.log("Service Name:", serviceData.name);
    console.log("Items count:", serviceData.serviceItems.length);
  }
  process.exit(0);
}

main().catch(console.error);
