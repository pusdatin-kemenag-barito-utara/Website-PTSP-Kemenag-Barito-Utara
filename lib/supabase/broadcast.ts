import { createAdminClient } from "./admin";

export async function emitRefreshSignal() {
  try {
    const supabase = createAdminClient();
    
    await supabase.channel('app-sync').send({
      type: 'broadcast',
      event: 'refresh',
      payload: { timestamp: new Date().getTime() },
    });
  } catch (error) {
    console.warn("Failed to emit refresh signal:", error);
  }
}
