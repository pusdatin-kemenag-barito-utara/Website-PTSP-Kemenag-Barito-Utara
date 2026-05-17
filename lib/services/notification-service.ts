import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and, sql, isNull } from "drizzle-orm";

export class NotificationService {
  /**
   * Create a new notification
   */
  static async create(params: {
    userId?: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    link?: string;
  }) {
    return await db.insert(notifications).values({
      userId: params.userId || null,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    });
  }

  /**
   * Get notifications for a user (or global if userId is null)
   */
  static async getForUser(userId?: string, limit = 50) {
    const whereClause = userId
      ? eq(notifications.userId, userId)
      : isNull(notifications.userId);

    return await db.query.notifications.findMany({
      where: whereClause,
      orderBy: [desc(notifications.createdAt)],
      limit,
    });
  }

  /**
   * Get count of unread notifications
   */
  static async getUnreadCount(userId?: string): Promise<number> {
    const whereClause = userId
      ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      : and(isNull(notifications.userId), eq(notifications.isRead, false));

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(whereClause);

    return Number(result?.count || 0);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId?: string) {
    const whereClause = userId
      ? eq(notifications.userId, userId)
      : isNull(notifications.userId);

    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(whereClause);
  }

  /**
   * Clear old notifications (optional cleanup)
   */
  static async clearAll(userId?: string) {
    const whereClause = userId
      ? eq(notifications.userId, userId)
      : isNull(notifications.userId);

    return await db.delete(notifications).where(whereClause);
  }
}
