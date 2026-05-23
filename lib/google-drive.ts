import { google } from "googleapis";
import { Readable } from "stream";

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

export async function getDriveClient() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials are missing");
  }

  let formattedKey = PRIVATE_KEY;
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.substring(1, formattedKey.length - 1);
  }
  formattedKey = formattedKey.split('\\n').join('\n');

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function uploadToGoogleDrive(file: File, folderPath: string) {
  try {
    const drive: any = await getDriveClient();
    
    // Convert File to readable stream or buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Split folderPath to create nested directories if they don't exist
    // E.g., folderPath = "requests/User_Name/PTSP-2026-0001"
    const parts = folderPath.split("/").filter(Boolean);
    let parentId: string | undefined = undefined;

    for (const part of parts) {
      // Find if directory exists under current parentId
      const query: string = `name = '${part}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${
        parentId ? ` and '${parentId}' in parents` : " and 'root' in parents"
      }`;
      
      const res: any = await drive.files.list({
        q: query,
        fields: "files(id)",
        spaces: "drive",
      });

      const existingFolder: any = res.data.files?.[0];
      if (existingFolder?.id) {
        parentId = existingFolder.id;
      } else {
        // Create the folder
        const folderMetadata: any = {
          name: part,
          mimeType: "application/vnd.google-apps.folder",
          parents: parentId ? [parentId] : undefined,
        };
        const folder: any = await drive.files.create({
          requestBody: folderMetadata,
          fields: "id",
        });
        parentId = folder.data.id || undefined;
      }
    }

    // Now upload the file inside the final parent folder
    const fileMetadata: any = {
      name: file.name,
      parents: parentId ? [parentId] : undefined,
    };

    const media: any = {
      mimeType: file.type || "application/octet-stream",
      body: stream,
    };

    const response: any = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    return {
      id: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error.message || error);
    // Return error to allow the request to proceed if drive fails but R2 succeeds
    return { error: error.message };
  }
}
