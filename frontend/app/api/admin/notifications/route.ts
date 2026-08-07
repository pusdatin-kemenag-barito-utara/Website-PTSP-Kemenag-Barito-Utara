import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notification-service";

export async function GET() {
  try {
    await requireAdmin();
    // For admin panel, we fetch global notifications (where userId is null)
    // or we could fetch specifically for the current admin
    const data = await NotificationService.getForUser();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { action, id } = await request.json();

    if (action === "markAsRead") {
      await NotificationService.markAsRead(id);
    } else if (action === "markAllRead") {
      await NotificationService.markAllAsRead();
    } else if (action === "clear") {
      await NotificationService.clearAll();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
