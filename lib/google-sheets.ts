import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

export async function getSheetsClient() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials are missing");
  }

  // Format the private key if it's coming from an environment variable with escaped newlines
  const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^"|"$/g, "");

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
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
