import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: { name: "ptsp-auth" },
  });
}