import { google } from "googleapis";
import { Readable } from "stream";

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function getDriveClient() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials are missing");
  }

  // Format the private key
  const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^"|"$/g, "");

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

export async function uploadToDrive(file: File, folderId?: string) {
  const drive = await getDriveClient();
  const parentFolderId = folderId || DEFAULT_FOLDER_ID;

  // Convert File to Readable Stream
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: parentFolderId ? [parentFolderId] : [],
    },
    media: {
      mimeType: file.type,
      body: stream,
    },
    fields: "id, name, webViewLink",
  });

  return response.data;
}

export async function deleteFromDrive(fileId: string) {
  const drive = await getDriveClient();
  try {
    await drive.files.delete({
      fileId,
    });
    return true;
  } catch (error) {
    console.error("Error deleting from Drive:", error);
    return false;
  }
}

export async function getOrCreateFolder(
  folderName: string,
  parentFolderId?: string,
) {
  const drive = await getDriveClient();

  // Check if folder exists
  const list = await drive.files.list({
    q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${
      parentFolderId || "root"
    }' in parents and trashed = false`,
    fields: "files(id, name)",
  });

  if (list.data.files && list.data.files.length > 0) {
    return list.data.files[0].id;
  }

  // Create folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : [],
    },
    fields: "id",
  });

  return folder.data.id;
}
