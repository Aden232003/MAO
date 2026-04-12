/**
 * MAO — Google Apps Script for Form Submissions
 *
 * SETUP:
 * 1. Go to https://script.google.com → New Project
 * 2. Paste this entire file
 * 3. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL
 * 5. Paste it into script.js where it says APPS_SCRIPT_URL
 *
 * This creates two sheets:
 * - "Applications" — from the apply form
 * - "Vault Emails" — from the vault unlock form
 */

const SPREADSHEET_ID = ''; // Leave blank to auto-create, or paste your Sheet ID

function getOrCreateSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  // Check if it already exists
  const files = DriveApp.getFilesByName('MAO Applications & Leads');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  // Create new
  const ss = SpreadsheetApp.create('MAO Applications & Leads');

  // Set up Applications sheet
  const appSheet = ss.getActiveSheet();
  appSheet.setName('Applications');
  appSheet.appendRow([
    'Timestamp', 'Full Name', 'Email', 'Instagram', 'Phone',
    'Current Status', 'Income Range', 'Pain Point', 'Why Join', 'Source'
  ]);
  appSheet.setFrozenRows(1);
  appSheet.getRange('1:1').setFontWeight('bold');

  // Set up Vault Emails sheet
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

    // Exact timestamp in IST (e.g. "2026-04-12 14:32:07 IST")
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss') + ' IST';

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
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'MAO form endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
