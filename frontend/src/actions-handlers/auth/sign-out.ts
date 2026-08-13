import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/lib/next-compat/navigation";

export async function signOutAction(redirectToPath: string = "/", injectedCtx?: any) {
  if (typeof redirectToPath !== "string") {
    // Jika redirectToPath adalah object (karena diinjeksi oleh context server), kita kembalikan ke '/'
    injectedCtx = redirectToPath;
    redirectToPath = "/";
  }
  
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectToPath);
}
