# Google Apps Script — Lead handler

This script receives form submissions from the website and logs leads to your Google Sheet. It can also serve the landing page if you embed the HTML in `doGet()` (optional).

## Deploy steps

### 1. Create or open your Google Sheet

- Spreadsheet ID is in `Code.gs` → `CONFIG.SPREADSHEET_ID`
- Sheet tab name: `CoverIQ Insurance Leads` (or change `SHEET_NAME` in CONFIG)

### 2. Add the script

1. Go to [script.google.com](https://script.google.com)
2. New project → name it e.g. `Chandler Hill Leads`
3. Delete default `Code.gs` content
4. Paste entire contents of `Code.gs` from this folder
5. Save

### 3. Set up sheet headers (one time)

1. In the Apps Script editor, select `setupSheetHeaders` from the function dropdown
2. Click **Run** and approve permissions
3. Confirm row 1 on `CoverIQ Insurance Leads` matches the column list in `Code.gs`

If the tab already has old headers (e.g. a single `Timestamp` column), add the new columns manually or use a fresh tab — do not run `setupSheetHeaders` on a sheet with existing data without backing up first.

### 4. Deploy as Web App

1. **Deploy** → **New deployment** → type **Web app**
2. **Execute as:** Me
3. **Who has access:** Anyone (required for the GitHub Pages site to POST leads)
4. Copy the **Web app URL** (ends with `/exec`)

### 5. Connect the website

In `main.js` on the site root:

```javascript
window.CHA_API_URL = "PASTE_YOUR_WEB_APP_URL_HERE/exec";
```

Redeploy or refresh the site after updating `main.js`.

### 5b. Authorize the Web App (first time)

When you open the URL in a browser, Google may ask you to authorize the script. Click through and allow access. This is normal for `script.google.com` deployments set to "Anyone" or "Anyone with Google account."

### 6. Test

1. Open the live site → Quotes tab
2. Submit a test lead
3. Confirm new row in the sheet with **Lead ID**, **Date**, **Time**, and referral fields
4. Check email if `SEND_EMAIL_NOTIFICATIONS` is true

## Column reference

| Column | Source |
|--------|--------|
| Lead ID | Auto-generated on submit |
| Date | `yyyy-MM-dd` (sheet timezone) |
| Time | `HH:mm:ss` |
| Brand | `chandler_hill_agency` |
| First Name … ZIP | Form |
| Heard About | Form (`heardAbout`) |
| Referrer Phone / Email / Address | Form (when "Friend or Colleague") |
| Source | `Landing Page` |

## Your info in CONFIG (edit in `Code.gs`)

| Field | Value |
|-------|--------|
| Agency | Chandler Hill Agency |
| Agent | Chandler Hill |
| Website | https://chandlerhillagency.com |
| Primary line | (574) 309-0107 |
| Agency line | (574) 465-1495 |
| Emails | chandlerdhill96@gmail.com, chandler@cover-iq.com, chandlerhill1@allstate.com |
| South Bend | (574) 232-6945 — 2039 E Ireland Rd, South Bend, IN 46614 |
| Plymouth | (574) 936-7157 — 536 N Oak Dr, Plymouth, IN 46563 |
| Goshen | (574) 534-5696 — 114 E Clinton St, Goshen, IN 46528 |
| Sheet | CoverIQ Insurance Leads (spreadsheet ID in CONFIG) |
| Brand | chandler_hill_agency |

New-lead notification emails include this footer so you always see your direct lines and office numbers in the thread.

## Optional: marble background in embedded HTML

If your landing HTML in `doGet()` uses `MARBLE_BG_DATA_URL`, paste your base64 marble image into that constant in `Code.gs` (same as before).

## Removing the script later

Delete the deployment or replace `Code.gs` with a no-op `doPost` that returns `{ok:true}` if you move submission handling elsewhere.