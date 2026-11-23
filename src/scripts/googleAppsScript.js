/**
 * ==============================================================================
 * LAKSHMI AGENCY - MASTER GOOGLE APPS SCRIPT WEBHOOK ENGINE
 * ==============================================================================
 * Use this script inside the Google Sheet attached to your Google Form(s):
 * - Order Form: https://forms.gle/ydedLFJwcef59hPD7
 * - Refund Form: https://forms.gle/ssWFUKVpoxoKzKWc8
 *
 * HOW TO SETUP (Takes 2 minutes):
 * 1. Open your Google Sheet linked to the form.
 * 2. In top menu, click: Extensions > Apps Script.
 * 3. Delete any default code and paste this ENTIRE file.
 * 4. Verify WEBHOOK_BASE_URL (replace with your production Vercel domain or test tunnel).
 * 5. Click the "Triggers" clock icon on the left navigation bar > Click "+ Add Trigger":
 *      - Choose which function to run: onFormSubmit
 *      - Which runs at deployment: Head
 *      - Select event source: From spreadsheet
 *      - Select event type: On form submit
 *      - Failure notification: Immediately
 * 6. Click Save and allow Google permissions. You are DONE!
 * ==============================================================================
 */

// Production Canonical API Webhook Base URL (Always use www.lakshmiagency.net to avoid 308 redirects)
const WEBHOOK_BASE_URL = "https://www.lakshmiagency.net/api/webhooks/google-form";
const SECRET_TOKEN = "lakshmi_agency_secure_webhook_token_2026";

/**
 * Main Trigger function called automatically whenever a Google Form is submitted
 */
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowValues = e ? e.values : null;
    const rowIndex = e && e.range ? e.range.getRow() : sheet.getLastRow();

    // Fallback if rowValues is not provided by trigger event (manual run)
    const currentRowValues = rowValues || sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Convert row submission into a structured key-value payload
    const payload = {
      timestamp: new Date().toISOString(),
      sheetName: sheet.getName(),
      data: {},
    };

    for (let i = 0; i < headers.length; i++) {
      const headerKey = headers[i].toString().trim();
      const value = currentRowValues[i] ? currentRowValues[i].toString().trim() : "";
      payload.data[headerKey] = value;
    }

    // Determine if this is an Order Form or Refund Form
    const sheetNameLower = sheet.getName().toLowerCase();
    const dataString = JSON.stringify(payload.data).toLowerCase();

    const isRefundForm =
      sheetNameLower.includes("refund") ||
      dataString.includes("upi") ||
      dataString.includes("review screenshot") ||
      dataString.includes("claim");

    // Pass secret in both URL query param and header to ensure 100% delivery across all network hops
    const endpoint =
      (isRefundForm ? `${WEBHOOK_BASE_URL}/refund` : `${WEBHOOK_BASE_URL}/order`) +
      `?secret=${encodeURIComponent(SECRET_TOKEN)}`;

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-webhook-secret": SECRET_TOKEN,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: true,
    };

    Logger.log("Sending payload to: " + endpoint);
    const response = UrlFetchApp.fetch(endpoint, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + statusCode);
    Logger.log("Response Body: " + responseText);

    // Ensure a "Sync Status" column exists at the end of the sheet
    let statusCol = headers.findIndex((h) => h.toString().toLowerCase().includes("sync status")) + 1;
    if (statusCol === 0) {
      statusCol = headers.length + 1;
      sheet.getRange(1, statusCol).setValue("Agency Sync Status");
    }

    // Parse Response
    let json = {};
    try {
      json = JSON.parse(responseText);
    } catch (err) {}

    // Update status cell in Google Sheet
    if (statusCode === 200) {
      if (isRefundForm) {
        sheet.getRange(rowIndex, statusCol).setValue("✅ SYNCED TO LAKSHMI AGENCY (STATUS: REFUND PENDING)");
      } else {
        sheet.getRange(rowIndex, statusCol).setValue("✅ ORDER REGISTERED & SLOTS DEDUCTED");
      }
    } else if (statusCode === 404 && isRefundForm) {
      // Order ID was NOT found in database (No Order Form was ever filled!)
      sheet.getRange(rowIndex, statusCol).setValue("⚠️ REJECTED: NO ORDER FORM DETECTED (ACTION REQUIRED)");

      // Optional: Send automated email notification to buyer if email column exists
      notifyBuyerNoOrderForm(payload.data);
    } else {
      sheet.getRange(rowIndex, statusCol).setValue("⚠️ SYNC PENDING (" + (json.error || "Review Needed") + ")");
    }
  } catch (error) {
    Logger.log("Webhook Trigger Error: " + error.toString());
  }
}

/**
 * Helper to notify buyer if they submitted Refund Form without filling Order Form first
 */
function notifyBuyerNoOrderForm(data) {
  try {
    let email = "";
    let orderId = "";
    let name = "Valued Customer";

    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      if (lower.includes("email") && data[key].includes("@")) email = data[key];
      if (lower.includes("order") && data[key]) orderId = data[key];
      if (lower.includes("name") && data[key]) name = data[key];
    }

    if (email) {
      const subject = "⚠️ Action Required: Order Form Not Detected for Order #" + orderId + " - Lakshmi Agency";
      const body =
        "Dear " + name + ",\n\n" +
        "We received your Refund Form submission for Order #" + orderId + ", but our system could not detect an Order Form submission for this order.\n\n" +
        "Under Lakshmi Agency Rule #2 & #8, you must submit the Order Form immediately after placing your marketplace order before a refund can be approved.\n\n" +
        "👉 Please submit your Order Form here right away: https://forms.gle/ydedLFJwcef59hPD7\n\n" +
        "Once your Order Form is received, our team will process your refund claim.\n\n" +
        "Thank you,\nLakshmi Agency\n'Your Needs... Our Priority...'";

      MailApp.sendEmail(email, subject, body);
      Logger.log("Sent Order Form Missing notification to: " + email);
    }
  } catch (e) {
    Logger.log("Email Notification Error: " + e.toString());
  }
}

/**
 * UTILITY FUNCTION: Run this from Apps Script editor to re-sync any rows marked 'SYNC PENDING'
 */
function syncAllPendingRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  let statusCol = headers.findIndex((h) => h.toString().toLowerCase().includes("sync status")) + 1;
  if (statusCol === 0) statusCol = headers.length + 1;

  for (let r = 2; r <= lastRow; r++) {
    const statusVal = sheet.getRange(r, statusCol).getValue().toString();
    if (statusVal.includes("PENDING") || !statusVal || statusVal.includes("Review Needed")) {
      Logger.log("Re-syncing row #" + r);
      const rowValues = sheet.getRange(r, 1, 1, sheet.getLastColumn()).getValues()[0];
      onFormSubmit({ range: sheet.getRange(r, 1, 1, sheet.getLastColumn()), values: rowValues });
    }
  }
}
