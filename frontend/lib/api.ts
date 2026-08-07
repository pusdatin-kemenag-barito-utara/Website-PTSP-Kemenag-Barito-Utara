const GOLANG_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GOLANG_API_URL || "http://127.0.0.1:8080/api/v1";

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${GOLANG_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

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
      console.warn(`[fetchAPI Warning] Endpoint ${endpoint} returned status ${response.status}: ${errorMessage}`);
      return { success: false, data: [] } as unknown as T;
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[fetchAPI Error] Failed to connect to Golang API at ${url}: ${err.message}`);
    return { success: false, data: [] } as unknown as T;
  }
}


