function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side (SSR / Server Component / Server Action)
    // Utamakan koneksi internal langsung via 127.0.0.1 agar tidak keluar ke internet (tanpa network latency)
    return process.env.INTERNAL_API_URL || "http://127.0.0.1:8080/api/v1";
  }
  // Client-side (Browser)
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_GOLANG_API_URL ||
    "http://127.0.0.1:8080/api/v1"
  );
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
      if (response.status !== 404 || !endpoint.includes("/admin/users/")) {
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
