import { fetchAPI } from "@/lib/api";

export class NotificationService {
  static async create(params: {
    userId?: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    link?: string;
  }) {
    return { success: true };
  }

  static async getForUser(userId?: string, _limit = 50) {
    try {
      const res = await fetchAPI<any>(`/notifications?userId=${encodeURIComponent(userId || "")}`);
      return res?.data || [];
    } catch {
      return [];
    }
  }

  static async getUnreadCount(_userId?: string): Promise<number> {
    return 0;
  }

  static async markAsRead(_notificationId: string) {
    return { success: true };
  }

  static async markAllAsRead(_userId?: string) {
    return { success: true };
  }

  static async clearAll(_userId?: string) {
    return { success: true };
  }
}
