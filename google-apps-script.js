/**
 * MAO — Google Apps Script for Form Submissions
 *
 * RECOVERY FLOW (when the /exec URL returns 403):
 * 1. Paste this ENTIRE file over everything in the Apps Script editor.
 * 2. File → Save (⌘S). Confirm no red error indicators in the gutter.
 * 3. Select function: "doGet" in the top toolbar → Run ▶.
 *    If prompted: Review permissions → pick adengomes50@gmail.com →
 *    Advanced → Go to [project] (unsafe) → Allow.
 *    This re-authorizes Drive + Sheets scopes.
 * 4. Execution log should show "MAO form endpoint is live." — no red errors.
 * 5. Deploy → Manage deployments → ✏️ on the active one → Version: "New
 *    version" → Description: "re-auth YYYY-MM-DD" → Deploy.
 *    (Creating a NEW version under the same deployment keeps the URL stable.)
 * 6. Copy the Web App URL (should be the same /exec path you already use).
 * 7. Paste it into script.js APPS_SCRIPT_URL if it ever changes.
 *
 * Pin the Sheet: once the "MAO Applications & Leads" sheet exists, open it,
 * copy the ID from its URL (the long string between /d/ and /edit), and
 * paste it into SPREADSHEET_ID below. This removes the Drive dependency
 * and makes the script MUCH more resilient — DriveApp scope is the most
 * common thing Google revokes on inactive personal accounts.
 */

const SPREADSHEET_ID = ''; // ⇐ paste the Sheet ID once the sheet exists.

function getOrCreateSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  // Check if it already exists (requires DriveApp scope).
  const files = DriveApp.getFilesByName('MAO Applications & Leads');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  // Create new.
  const ss = SpreadsheetApp.create('MAO Applications & Leads');

  // Applications sheet
  const appSheet = ss.getActiveSheet();
  appSheet.setName('Applications');
  appSheet.appendRow([
    'Timestamp', 'Full Name', 'Email', 'Instagram', 'Phone',
    'Current Status', 'Income Range', 'Pain Point', 'Why Join', 'Source'
  ]);
  appSheet.setFrozenRows(1);
  appSheet.getRange('1:1').setFontWeight('bold');

  // Vault Emails sheet
  const vaultSheet = ss.insertSheet('Vault Emails');
  vaultSheet.appendRow(['Timestamp', 'Email', 'Source']);
  vaultSheet.setFrozenRows(1);
  vaultSheet.getRange('1:1').setFontWeight('bold');

  Logger.log('Created spreadsheet: ' + ss.getUrl());
  return ss;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getOrCreateSpreadsheet();

    const timestamp =
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss') + ' IST';

    if (data.form_type === 'vault_unlock') {
      const sheet = ss.getSheetByName('Vault Emails');
      sheet.appendRow([
        timestamp,
        data.email || '',
        data.source || 'website'
      ]);
    } else if (data.form_type === 'beta_application') {
      const sheet = ss.getSheetByName('Applications');
      sheet.appendRow([
        timestamp,
        data.full_name || '',
        data.email || '',
        data.instagram || '',
        data.phone || '',
        data.current_status || '',
        data.income_range || '',
        data.pain_point || '',
        data.why_join || '',
        data.source || 'website'
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // Always log so Executions tab shows what failed.
    Logger.log('doPost error: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(_e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'MAO form endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
