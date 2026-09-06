import type { APIRoute } from "astro";
import { fetchAPI } from "@/lib/api";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Proxy request ke backend Golang menggunakan fetchAPI internal
    const responseData = await fetchAPI("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error: any) {
    console.error("Error in chat proxy:", error);
    return new Response(JSON.stringify({ error: "Maaf, koneksi server terganggu." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
