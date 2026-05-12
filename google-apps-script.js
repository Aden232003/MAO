/**
 * MAO / Google Apps Script for Form Submissions
 *
 * RECOVERY FLOW (when the /exec URL returns 403):
 * 1. Paste this ENTIRE file over everything in the Apps Script editor.
 * 2. File → Save (⌘S). Confirm no red error indicators in the gutter.
 * 3. Select function: "doGet" in the top toolbar → Run ▶.
 *    If prompted: Review permissions → pick adengomes50@gmail.com →
 *    Advanced → Go to [project] (unsafe) → Allow.
 *    This re-authorizes Drive + Sheets scopes.
 * 4. Execution log should show "MAO form endpoint is live." with no red errors.
 * 5. Deploy → Manage deployments → ✏️ on the active one → Version: "New
 *    version" → Description: "re-auth YYYY-MM-DD" → Deploy.
 *    (Creating a NEW version under the same deployment keeps the URL stable.)
 * 6. Copy the Web App URL (should be the same /exec path you already use).
 * 7. Paste it into script.js APPS_SCRIPT_URL if it ever changes.
 *
 * Pin the Sheet: once the "MAO Applications & Leads" sheet exists, open it,
 * copy the ID from its URL (the long string between /d/ and /edit), and
 * paste it into SPREADSHEET_ID below. This removes the Drive dependency
 * and makes the script MUCH more resilient. DriveApp scope is the most
 * common thing Google revokes on inactive personal accounts.
 */

const SPREADSHEET_ID = '1FML3ghv97RwZmx3bUwPsrU7uvfDRxuhLtnIOEBgiLgU';

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

  // Workshop Purchases sheet (Tier 1 = files only, Tier 2 = applicant ticket)
  const wsSheet = ss.insertSheet('Workshop Purchases');
  wsSheet.appendRow(['Timestamp', 'Tier', 'Payment ID', 'Type', 'Source']);
  wsSheet.setFrozenRows(1);
  wsSheet.getRange('1:1').setFontWeight('bold');

  Logger.log('Created spreadsheet: ' + ss.getUrl());
  return ss;
}

// Lazily create the Workshop Purchases tab on existing sheets that pre-date it.
function getWorkshopSheet(ss) {
  let sheet = ss.getSheetByName('Workshop Purchases');
  if (!sheet) {
    sheet = ss.insertSheet('Workshop Purchases');
    sheet.appendRow(['Timestamp', 'Tier', 'Payment ID', 'Type', 'Source']);
    sheet.setFrozenRows(1);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

// Lazily create the anonymous cohort feedback tab. Schema is deliberately
// minimal: timestamp + session number + 8 answer fields. No identifier
// columns. Do not append IP, referrer, name, or email here for any reason.
function getFeedbackSheet(ss) {
  let sheet = ss.getSheetByName('Session Feedback');
  if (!sheet) {
    sheet = ss.insertSheet('Session Feedback');
    sheet.appendRow([
      'Timestamp',
      'Session',
      'Q1 Overall (1-10)',
      'Q2 Most Valuable',
      'Q3 Unclear or Slow',
      'Q4 Money Confidence (1-10)',
      'Q5 Why That Number',
      'Q6 Where Stuck',
      'Q7 More Of / Less Of',
      'Q8 Anything Else'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 90);
    for (let col = 4; col <= 10; col++) {
      if (col === 6) { sheet.setColumnWidth(col, 90); continue; }
      sheet.setColumnWidth(col, 280);
    }
  }
  return sheet;
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
    } else if (data.form_type === 'workshop_purchase' || data.form_type === 'applicant_ticket') {
      // Workshop checkout pings from /workshop-thanks. Tier 1 = working
      // directory only; Tier 2 = applicant ticket (also unlocks WD).
      const sheet = getWorkshopSheet(ss);
      sheet.appendRow([
        timestamp,
        data.tier || (data.form_type === 'applicant_ticket' ? 2 : 1),
        data.payment_id || '',
        data.form_type,
        data.source || 'workshop_thanks'
      ]);
    } else if (data.form_type === 'cohort_feedback') {
      // Anonymous post-session feedback. Do NOT add identifier fields here.
      // The submitting page POSTs answers only; no name, email, or IP.
      const sheet = getFeedbackSheet(ss);
      sheet.appendRow([
        timestamp,
        data.session || '',
        data.q1_overall || '',
        data.q2_valuable || '',
        data.q3_unclear || '',
        data.q4_confidence || '',
        data.q5_why || '',
        data.q6_stuck || '',
        data.q7_more_less || '',
        data.q8_else || ''
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
