import "server-only";
import { getEnv } from "@/lib/env";

export async function emitRefreshSignal() {
  try {
    const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: 'app-sync',
            event: 'refresh',
            payload: { timestamp: new Date().getTime() },
          }
        ]
      }),
    });
  } catch (error) {
    console.warn("Failed to emit refresh signal:", error);
  }
}
