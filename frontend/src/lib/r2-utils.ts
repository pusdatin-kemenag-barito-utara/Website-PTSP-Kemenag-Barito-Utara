const FILES_DOMAIN = "https://files.kemenag-baritoutara.com";

/**
 * Resolves any file path or raw URL to the official high-speed Cloudflare Worker domain:
 * https://files.kemenag-baritoutara.com/ptsp/...
 */
export function resolveFileViewerUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "EXPIRED") return "";

  // Already on the official CDN domain
  if (trimmed.startsWith(FILES_DOMAIN)) {
    return trimmed;
  }

  // Stored with r2: prefix
  if (trimmed.startsWith("r2:")) {
    const key = trimmed.replace(/^r2:/, "").replace(/^\/+/, "");
    return `${FILES_DOMAIN}/ptsp/${key}`;
  }

  // Cloudflare r2.dev URLs (convert to official worker domain)
  if (trimmed.includes(".r2.dev/")) {
    try {
      const urlObj = new URL(trimmed);
      const key = urlObj.pathname.replace(/^\/+/, "");
      return `${FILES_DOMAIN}/ptsp/${key}`;
    } catch {
      const parts = trimmed.split(".r2.dev/");
      if (parts.length > 1) {
        return `${FILES_DOMAIN}/ptsp/${parts[1].replace(/^\/+/, "")}`;
      }
    }
  }

  // S3 / R2 storage direct endpoints
  if (trimmed.includes(".r2.cloudflarestorage.com/")) {
    try {
      const urlObj = new URL(trimmed);
      const key = urlObj.pathname.replace(/^\/(data-ptsp|ptsp)\//, "").replace(/^\/+/, "");
      return `${FILES_DOMAIN}/ptsp/${key}`;
    } catch {
      return trimmed;
    }
  }

  // Stored as relative path like documents/... or requests/... or results/... or videos/...
  if (
    trimmed.startsWith("documents/") ||
    trimmed.startsWith("requests/") ||
    trimmed.startsWith("results/") ||
    trimmed.startsWith("videos/") ||
    trimmed.startsWith("uploads/")
  ) {
    const cleanKey = trimmed.replace(/^uploads\//, "");
    return `${FILES_DOMAIN}/ptsp/${cleanKey}`;
  }

  return trimmed;
}

export function getR2PublicUrl(path: string): string {
  return resolveFileViewerUrl(path);
}

export function isR2Path(path: string | null | undefined): boolean {
  if (!path) return false;
  return (
    path.startsWith("r2:") ||
    path.startsWith("documents/") ||
    path.startsWith("requests/") ||
    path.startsWith("results/") ||
    path.startsWith("videos/") ||
    path.includes(".r2.dev/") ||
    path.includes(".r2.cloudflarestorage.com/") ||
    path.includes("files.kemenag-baritoutara.com/ptsp/")
  );
}
