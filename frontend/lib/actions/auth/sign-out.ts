"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction(redirectToPath: string = "/") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectToPath);
}
