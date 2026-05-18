// Official Cloudflare Turnstile Testing Secretkey (Always passes)
const DEFAULT_TESTING_SECRET_KEY = "1x00000000000000000000000000000000";

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

  const secretKey =
    process.env.TURNSTILE_SECRET_KEY || DEFAULT_TESTING_SECRET_KEY;

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
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Turnstile verification failed with status: ${response.status}`
      );
      return false;
    }

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      console.warn("Turnstile verification returned failure:", result["error-codes"]);
    }

    return result.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}
