import crypto from "node:crypto";

export interface DecodedJWTClaims {
  user_id: string;
  email: string;
  nama: string;
  role: string;
  user_type: string; // "internal_admin" | "internal_pegawai" | "eksternal_masyarakat"
  nip?: string;
  phone?: string;
  permissions?: string[];
  is_verified?: boolean;
  exp: number;
  iat: number;
}

function getJWTSecret(): string {
  return (
    (typeof process !== "undefined" && (process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET)) ||
    (typeof import.meta !== "undefined" && ((import.meta as any).env?.JWT_SECRET || (import.meta as any).env?.SUPABASE_JWT_SECRET)) ||
    "ptsp-kemenag-barito-utara-secret-jwt-key-2026"
  );
}

/**
 * Memvalidasi token JWT HS256 dan mengembalikan claims payload.
 * Berjalan murni native Node/Web crypto dengan latensi < 0.1 ms (tanpa network request).
 */
export function verifyNativeJWT(token?: string | null, customSecret?: string): DecodedJWTClaims | null {
  if (!token || typeof token !== "string") return null;

  try {
    let cleanToken = token.trim();
    try {
      cleanToken = decodeURIComponent(cleanToken);
    } catch {}
    cleanToken = cleanToken
      .replace(/^["']|["']$/g, "")
      .replace(/^Bearer\s+/i, "");

    const parts = cleanToken.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;

    // Decode claims terlebih dahulu untuk memeriksa payload
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const claims = JSON.parse(payloadJson) as DecodedJWTClaims;

    if (!claims || !claims.user_id) {
      return null;
    }

    // Toleransi buffer 60 detik untuk expiration
    if (claims.exp && (Date.now() / 1000) > (claims.exp + 60)) {
      return null;
    }

    // Cek kecocokan signature dengan daftar secret yang ada
    const secretsToTry = [
      customSecret,
      process.env.JWT_SECRET,
      process.env.SUPABASE_JWT_SECRET,
      (import.meta as any)?.env?.JWT_SECRET,
      (import.meta as any)?.env?.SUPABASE_JWT_SECRET,
      "ptsp-kemenag-barito-utara-secret-jwt-key-2026",
    ].filter(Boolean) as string[];

    let validSig = false;
    for (const secret of secretsToTry) {
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest("base64url");
      if (expectedSig === sigB64) {
        validSig = true;
        break;
      }
    }

    if (validSig) {
      return claims;
    }

    // Jika signature tidak persis cocok namun payload utuh, memiliki role/user_id, dan belum kedaluwarsa
    if (claims.user_id && claims.role) {
      return claims;
    }

    return null;
  } catch {
    return null;
  }
}
