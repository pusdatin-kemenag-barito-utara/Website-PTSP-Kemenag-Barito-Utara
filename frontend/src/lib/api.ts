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
  let token = "";
  if (typeof window !== "undefined") {
    token =
      readDocumentCookie("ptsp-auth") ||
      readDocumentCookie("ptsp-auth-access-token") ||
      localStorage.getItem("ptsp-auth-token") ||
      "";
  } else {
    const ctx = tryGetRequestContext();
    if (ctx?.cookies) {
      token =
        ctx.cookies.get("ptsp-auth")?.value ||
        ctx.cookies.get("ptsp-auth-access-token")?.value ||
        "";
    }
    if (!token && (globalThis as any).__ptsp_current_token) {
      token = (globalThis as any).__ptsp_current_token;
    }
  }
  return token ? token.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "") : "";
}

const apiGetCache = new Map<string, { data: any; expiresAt: number }>();

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiGetCache.clear();
    return;
  }
  for (const key of apiGetCache.keys()) {
    if (key.includes(prefix)) {
      apiGetCache.delete(key);
    }
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const method = (options.method || "GET").toUpperCase();

  // Bersihkan cache jika terjadi operasi mutasi data (CREATE / UPDATE / DELETE)
  if (method !== "GET" && method !== "HEAD") {
    apiGetCache.clear();
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    defaultHeaders["Cookie"] = `ptsp-auth=${token}`;
  }

  // Cek Memory Cache untuk GET request yang aman di-cache singkat (0ms latensi)
  const isCacheable =
    method === "GET" &&
    options.cache !== "no-store" &&
    !options.headers?.hasOwnProperty("x-skip-cache");

  const cacheKey = `${url}::${token || "anon"}`;
  if (isCacheable) {
    const cached = apiGetCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return JSON.parse(JSON.stringify(cached.data)) as T;
    }
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
      const isQuiet =
        (response.status === 404 &&
          (endpoint.includes("/users/") ||
            endpoint.includes("/pegawai/cuti") ||
            endpoint.includes("/admin/system/status"))) ||
        (response.status === 401 && endpoint.includes("/admin/system/status"));

      if (!isQuiet) {
        console.warn(
          `[fetchAPI Warning] Endpoint ${endpoint} returned status ${response.status}: ${errorMessage}`,
        );
      }
      return { success: false, data: [], error: errorMessage } as unknown as T;
    }

    const data = await response.json();

    // Simpan ke memory cache
    if (isCacheable && data) {
      // Endpoint statis seperti layanan / master options disimpan 5 menit
      // Endpoint dinamis seperti stats / requests disimpan 3 detik agar sat-set tapi tetap fresh
      let ttl = 3000;
      if (endpoint.includes("/services") || endpoint.includes("/master-options")) {
        ttl = 5 * 60 * 1000; // 5 menit
      } else if (endpoint.includes("/videos") || endpoint.includes("/youtube")) {
        ttl = 10 * 60 * 1000; // 10 menit
      } else if (endpoint.includes("/system/status")) {
        ttl = 60 * 1000; // 1 menit
      }
      apiGetCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(
      `[fetchAPI Error] Failed to connect to Golang API at ${url}: ${err.message}`,
    );
    return { success: false, data: [] } as unknown as T;
  }
}