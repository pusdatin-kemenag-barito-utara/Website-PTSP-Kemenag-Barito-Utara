import { db } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export class LayananService {
  static async createService(data: any) {
    await db.insert(servicesTable).values({
      ...data,
      sortOrder: 0,
    });
  }

  static async updateService(id: bigint, data: any) {
    await db
      .update(servicesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servicesTable.id, id));
  }

  static async deleteService(id: bigint) {
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
  }

  static async reorderServices(ids: bigint[]) {
    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(servicesTable)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(servicesTable.id, BigInt(ids[i])));
      }
    });
  }

  /**
   * Get all services with only id and name for dropdowns
   */
  static async getAllServicesBrief(roleOwner?: string) {
    const whereClause = roleOwner ? eq(servicesTable.roleOwner, roleOwner as any) : undefined;
    return await db.query.services.findMany({
      columns: { id: true, name: true },
      where: whereClause,
      orderBy: [asc(servicesTable.name)],
    });
  }
}
