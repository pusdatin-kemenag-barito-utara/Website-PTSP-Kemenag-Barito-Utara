import { tryGetRequestContext } from "@/lib/request-context";

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side (SSR / Server Component / Server Action)
    // Utamakan koneksi internal langsung agar tidak keluar ke internet (tanpa network latency)
    return process.env.INTERNAL_API_URL || "http://127.0.0.1:8080/api/v1";
  }
  // Client-side (Browser)
  return (
    import.meta.env.PUBLIC_API_URL ||
    import.meta.env.PUBLIC_GOLANG_API_URL ||
    "http://127.0.0.1:8080/api/v1"
  );
}

function readDocumentCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

function getAuthToken(): string {
  // Ambil access token Supabase dari cookie session (ptsp-auth-access-token)
  if (typeof window !== "undefined") {
    return readDocumentCookie("ptsp-auth-access-token");
  }
  const ctx = tryGetRequestContext();
  if (ctx) {
    return ctx.cookies.get("ptsp-auth-access-token")?.value ?? "";
  }
  return "";
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutMs = (options as any)?.timeout || 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config: RequestInit = {
    ...options,
    signal: options.signal || controller.signal,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "Terjadi kesalahan pada server.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore JSON parse error
      }
      const isQuiet404 =
        response.status === 404 &&
        (endpoint.includes("/users/") || endpoint.includes("/pegawai/cuti"));

      if (!isQuiet404) {
        console.warn(
          `[fetchAPI Warning] Endpoint ${endpoint} returned status ${response.status}: ${errorMessage}`,
        );
      }
      return { success: false, data: [] } as unknown as T;
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(
      `[fetchAPI Error] Failed to connect to Golang API at ${url}: ${err.message}`,
    );
    return { success: false, data: [] } as unknown as T;
  }
}