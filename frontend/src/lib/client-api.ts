import { createClient } from "@/lib/supabase/client";

export function getClientApiBase(): string {
  return (
    (import.meta.env.PUBLIC_API_URL as string) ||
    (import.meta.env.PUBLIC_GOLANG_API_URL as string) ||
    "http://127.0.0.1:8080/api/v1"
  );
}

export function getClientAuthToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("ptsp-auth-access-token="));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}