/**
 * Enterprise Google Analytics (GA4) & Google Tag Manager (GTM) Utility
 * 
 * Modul ini menyediakan fungsi pelacakan aman (SSR-safe), type-safe,
 * dan terintegrasi langsung dengan window.dataLayer (GTM) serta window.gtag (GA4).
 * Semua ID dibaca secara dinamis dari Infisical environment variables, tidak di-hardcode.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Mengirim custom event ke Google Tag Manager (dataLayer) dan Google Analytics 4 (gtag)
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  // 1. Kirim ke GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
    timestamp: new Date().toISOString(),
  });

  // 2. Kirim ke GA4 gtag jika aktif
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/**
 * Pelacakan klik CTA (Call to Action)
 */
export function trackCTA(ctaName: string, destination?: string, location?: string) {
  trackEvent("cta_click", {
    cta_name: ctaName,
    destination_url: destination || "",
    cta_location: location || "page_content",
  });
}

/**
 * Pelacakan pencarian status permohonan (aman tanpa PII)
 */
export function trackPermohonan(trackNumber: string, status?: string) {
  // Hanya ambil prefix layanan (misal PUB-MDR) demi privasi, jangan kirim nomor identitas
  const prefix = trackNumber ? trackNumber.split("-").slice(0, 2).join("-") : "UNKNOWN";
  trackEvent("track_permohonan", {
    service_prefix: prefix,
    status_result: status || "searched",
  });
}

/**
 * Pelacakan pemilihan atau klik layanan
 */
export function trackServiceSelect(serviceName: string, category?: string) {
  trackEvent("select_service", {
    service_name: serviceName,
    service_category: category || "Umum",
  });
}

/**
 * Pelacakan klik tautan eksternal (WhatsApp, YouTube, Portal Kemenag, dll.)
 */
export function trackOutboundLink(url: string, linkText?: string) {
  trackEvent("outbound_click", {
    outbound_url: url,
    link_text: linkText || "",
  });
}

/**
 * Pelacakan unduhan berkas (PDF, DOCX, XLSX, dsb.)
 */
export function trackFileDownload(fileName: string, fileExtension?: string) {
  trackEvent("file_download", {
    file_name: fileName,
    file_extension: fileExtension || fileName.split(".").pop() || "",
  });
}

/**
 * Pelacakan pengiriman formulir publik (Buku Tamu, Janji Temu, dsb.)
 */
export function trackFormSubmission(formName: string, success: boolean = true) {
  trackEvent("form_submission", {
    form_name: formName,
    form_status: success ? "success" : "failed",
  });
}

/**
 * Pelacakan interaksi video profil
 */
export function trackVideoInteraction(videoTitle: string, action: "play" | "click" = "click") {
  trackEvent("video_interaction", {
    video_title: videoTitle,
    action,
  });
}
