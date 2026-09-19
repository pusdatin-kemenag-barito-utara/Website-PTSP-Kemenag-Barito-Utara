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
  const cookies = document.cookie.split("; ");
  const ptspAuth = cookies.find((row) => row.startsWith("ptsp-auth="));
  if (ptspAuth) {
    return decodeURIComponent(ptspAuth.split("=")[1] ?? "");
  }
  const match = cookies.find((row) => row.startsWith("ptsp-auth-access-token="));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

export async function getSessionUserId(): Promise<string | null> {
  // 1. Cek dari cookie ptsp-auth (native Golang JWT)
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split("; ");
    const ptspAuth = cookies.find((row) => row.startsWith("ptsp-auth="));
    if (ptspAuth) {
      try {
        const token = decodeURIComponent(ptspAuth.split("=")[1] ?? "");
        const parts = token.split(".");
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const json = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(json);
          if (payload.user_id) return payload.user_id;
          if (payload.sub) return payload.sub;
        }
      } catch (e) {
        console.warn("Failed to parse ptsp-auth cookie:", e);
      }
    }
  }

  // 2. Fallback ke Supabase auth
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