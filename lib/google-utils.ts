/**
 * Utility functions for Google Drive URLs that are safe to use in Client Components
 * as they do not import the 'googleapis' library.
 */

export function getDrivePreviewUrl(fileId: string) {
  // Opens the file in Google Drive's built-in viewer (new tab, no download)
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getDriveDownloadUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
