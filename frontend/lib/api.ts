const GOLANG_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GOLANG_API_URL || "http://localhost:8080/api";

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${GOLANG_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = "Terjadi kesalahan pada server.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse error for error responses
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
