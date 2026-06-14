import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

export async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials are missing");
  }

  // Sangat tangguh dalam menangani berbagai format dari VPS / Coolify
  let formattedKey = PRIVATE_KEY;
  
  // 1. Jika terbungkus tanda kutip, coba parse sebagai JSON string, atau hapus kutipnya
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    try {
      formattedKey = JSON.parse(formattedKey);
    } catch (e) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }
  } else if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
    formattedKey = formattedKey.substring(1, formattedKey.length - 1);
  }

  // 2. Ganti karakter literal "\n" atau "\\n" menjadi enter sungguhan
  formattedKey = formattedKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');

  // 3. Jika entah kenapa semua enter hilang dan jadi spasi
  if (!formattedKey.includes('\n')) {
    formattedKey = formattedKey.replace('-----BEGIN PRIVATE KEY----- ', '-----BEGIN PRIVATE KEY-----\n');
    formattedKey = formattedKey.replace(' -----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
  }

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

export async function getSheetData(range: string) {
  const sheets = await getSheetsClient();
  if (!SPREADSHEET_ID) throw new Error("GOOGLE_SHEETS_ID is missing");

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    return response.data.values || [];
  } catch (error: any) {
    console.error("Error in getSheetData:", error.message || error);
    throw error;
  }
}

export async function appendToSheet(range: string, values: any[][]) {
  const sheets = await getSheetsClient();
  if (!SPREADSHEET_ID) throw new Error("GOOGLE_SHEETS_ID is missing");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

/**
 * Inserts a new row at the top (right after the header/row 1)
 * Uses batchUpdate to ensure atomicity and prevent race conditions
 */
export async function prependToSheet(sheetName: string, values: any[][]) {
  const sheets = await getSheetsClient();
  if (!SPREADSHEET_ID) throw new Error("GOOGLE_SHEETS_ID is missing");

  // 1. Get sheet ID
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(
    (s: any) => s.properties?.title === sheetName,
  );
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  const sheetId = sheet.properties?.sheetId;

  // 2. Execute Atomic Batch Update
  // This combines inserting a row and updating it into one single request
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: 1,
              endIndex: 2,
            },
            inheritFromBefore: false,
          },
        },
        {
          updateCells: {
            rows: [
              {
                values: values[0].map((val: any) => ({
                  userEnteredValue:
                    typeof val === "number"
                      ? { numberValue: val }
                      : typeof val === "boolean"
                        ? { boolValue: val }
                        : { stringValue: String(val) },
                })),
              },
            ],
            fields: "userEnteredValue",
            start: {
              sheetId: sheetId,
              rowIndex: 1,
              columnIndex: 0,
            },
          },
        },
      ],
    },
  });
}

export async function updateSheetRow(range: string, values: any[][]) {
  const sheets = await getSheetsClient();
  if (!SPREADSHEET_ID) throw new Error("GOOGLE_SHEETS_ID is missing");

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

/**
 * Deletes a row from the sheet.
 * Note: Sheets API doesn't have a direct 'delete row by index' in values.
 * We use batchUpdate for this.
 */
export async function deleteSheetRow(sheetName: string, rowIndex: number) {
  const sheets = await getSheetsClient();
  if (!SPREADSHEET_ID) throw new Error("GOOGLE_SHEETS_ID is missing");

  // Get sheet ID from name
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s: any) => s.properties?.title === sheetName,
  );

  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties?.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}
