import { getEnv } from "@/lib/env";

function getSecretKey(): string {
  return process.env.TURNSTILE_SECRET_KEY || "";
}

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifies a Cloudflare Turnstile token from the client against Cloudflare's API.
 * 
 * @param token The token received from the client-side Turnstile widget
 * @param ip Optional IP address of the client
 * @returns Promise<boolean> True if verification succeeded, false otherwise
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<boolean> {
  // If no token was provided, it's immediately invalid
  if (!token) {
    return false;
  }

  const secretKey = getSecretKey();

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Turnstile verification failed with status: ${response.status}`
      );
      // In local development mode, fallback gracefully if Cloudflare API returns non-200 for localhost
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Turnstile] Dev mode: Allowing login pass despite Cloudflare non-200 response on localhost");
        return true;
      }
      return false;
    }

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      console.warn("[Turnstile] verification returned failure:", result["error-codes"]);
      // Allow pass in local development if test key or localhost domain mismatch
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Turnstile] Dev mode: Allowing login pass for localhost development");
        return true;
      }
    }

    return result.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    if (process.env.NODE_ENV !== "production") {
      return true; // Don't block dev testing if network fails locally
    }
    return false;
  }
}
