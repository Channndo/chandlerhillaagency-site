/**
 * Chandler Hill Agency — Lead form Web App
 * Canonical copy lives in ../google-apps-script/Code.gs — keep both in sync when editing.
 * Paste into Apps Script bound to your spreadsheet (or standalone + SPREADSHEET_ID).
 */

const CONFIG = {
  SPREADSHEET_ID: '1wtQuPgwjtYY0LcZWSb1hWM7SzanGevYqe8MyIdhh7oY',
  SHEET_NAME: 'CoverIQ Insurance Leads',
  BRAND_ENTRY: 'chandler_hill_agency',
  AGENCY_NAME: 'Chandler Hill Agency',
  AGENT_NAME: 'Chandler Hill',
  WEBSITE_URL: 'https://chandlerhillagency.com',
  EMAIL_RECIPIENTS: [
    'chandlerdhill96@gmail.com',
    'chandler@cover-iq.com',
    'chandlerhill1@allstate.com'
  ],
  SEND_EMAIL_NOTIFICATIONS: true,
  PHONE_NUMBER: '(574) 309-0107',
  AGENCY_PHONE: '(574) 465-1495',
  OFFICES: [
    { name: 'South Bend', address: '2039 E Ireland Rd, South Bend, IN 46614', phone: '(574) 232-6945' },
    { name: 'Plymouth', address: '536 N Oak Dr, Plymouth, IN 46563', phone: '(574) 936-7157' },
    { name: 'Goshen', address: '114 E Clinton St, Goshen, IN 46528', phone: '(574) 534-5696' }
  ],
  ALLOWED_STATES: ['IN', 'MI'],
  RATE_LIMIT_SECONDS: 120,
  MAX_LEN: {
    firstName: 80,
    lastName: 80,
    email: 120,
    phone: 20,
    street: 120,
    city: 80,
    state: 2,
    zip: 10,
    type: 80,
    carCount: 10,
    heardAbout: 80,
    referrerPhone: 20,
    referrerEmail: 120,
    referrerAddress: 200
  }
};

const HEADERS = [
  'Lead ID',
  'Date',
  'Time',
  'Brand',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Street',
  'City',
  'State',
  'ZIP',
  'Insurance Type',
  'Car Count',
  'Heard About',
  'Referrer Phone',
  'Referrer Email',
  'Referrer Address',
  'Source'
];

function doPost(e) {
  try {
    checkBurstRateLimit_();
    const payload = parsePayload_(e);
    validatePayload_(payload);
    checkRateLimit_(payload.email);

    const sheet = getSheet_();
    const leadId = generateLeadId_(sheet);
    const now = new Date();
    const tz = Session.getScriptTimeZone();
    const dateStr = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, tz, 'h:mm:ss a');

    sheet.appendRow([
      leadId,
      dateStr,
      timeStr,
      CONFIG.BRAND_ENTRY,
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.phone,
      payload.street,
      payload.city,
      payload.state,
      payload.zip,
      payload.type,
      payload.carCount,
      payload.heardAbout,
      payload.referrerPhone,
      payload.referrerEmail,
      payload.referrerAddress,
      'Landing Page'
    ]);

    if (CONFIG.SEND_EMAIL_NOTIFICATIONS) {
      sendLeadNotification_(leadId, dateStr, timeStr, payload);
    }

    return jsonResponse_({ ok: true, leadId: leadId });
  } catch (err) {
    const message = err && err.message ? err.message : 'Something went wrong.';
    return jsonResponse_({ ok: false, error: message });
  }
}

function doGet() {
  try {
    checkBurstRateLimit_();
    return jsonResponse_({ ok: true, message: 'Chandler Hill Agency lead endpoint is running.' });
  } catch (err) {
    const message = err && err.message ? err.message : 'Too many requests.';
    return jsonResponse_({ ok: false, error: message });
  }
}

function setupSheetHeaders() {
  const sheet = getSheet_();
  const lastCol = HEADERS.length;
  sheet.getRange(1, 1, 1, lastCol).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0b0b0d');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  SpreadsheetApp.flush();
  Logger.log('Headers applied to tab: ' + CONFIG.SHEET_NAME);
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (parseErr) {
    throw new Error('Invalid JSON payload.');
  }
  return {
    firstName: trim_(data.firstName, CONFIG.MAX_LEN.firstName),
    lastName: trim_(data.lastName, CONFIG.MAX_LEN.lastName),
    email: trim_(data.email, CONFIG.MAX_LEN.email).toLowerCase(),
    phone: cleanPhone_(data.phone),
    street: trim_(data.street, CONFIG.MAX_LEN.street),
    city: trim_(data.city, CONFIG.MAX_LEN.city),
    state: trim_(data.state, CONFIG.MAX_LEN.state).toUpperCase(),
    zip: trim_(data.zip, CONFIG.MAX_LEN.zip),
    type: trim_(data.type, CONFIG.MAX_LEN.type),
    carCount: trim_(data.carCount, CONFIG.MAX_LEN.carCount),
    heardAbout: trim_(data.heardAbout, CONFIG.MAX_LEN.heardAbout),
    referrerPhone: cleanPhone_(data.referrerPhone),
    referrerEmail: trim_(data.referrerEmail, CONFIG.MAX_LEN.referrerEmail).toLowerCase(),
    referrerAddress: trim_(data.referrerAddress, CONFIG.MAX_LEN.referrerAddress)
  };
}

function validatePayload_(p) {
  if (!p.firstName) throw new Error('First name is required.');
  if (!p.lastName) throw new Error('Last name is required.');
  if (!p.email) throw new Error('Email is required.');
  if (!isValidEmail_(p.email)) throw new Error('Please enter a valid email address.');
  if (!p.phone) throw new Error('Phone is required.');
  if (p.phone.length < 10) throw new Error('Please enter a valid phone number.');
  if (!p.zip) throw new Error('ZIP code is required.');
  if (!p.type) throw new Error('Insurance type is required.');
  if (p.state && CONFIG.ALLOWED_STATES.indexOf(p.state) === -1) {
    throw new Error('We can only quote policies in Indiana and Michigan at this time.');
  }
  const typeLower = p.type.toLowerCase();
  if ((typeLower.indexOf('auto') !== -1 || typeLower === 'bundle') && !p.carCount) {
    throw new Error('Please select how many cars.');
  }
  if (p.referrerEmail && !isValidEmail_(p.referrerEmail)) {
    throw new Error('Referrer email is not valid.');
  }
}

function checkBurstRateLimit_() {
  const cache = CacheService.getScriptCache();
  const minute = Math.floor(Date.now() / 60000);
  const key = 'burst_' + minute;
  const n = parseInt(cache.get(key) || '0', 10) + 1;
  cache.put(key, String(n), 120);
  if (n > 12) {
    throw new Error('Too many requests. Please try again in a minute.');
  }
}

function checkRateLimit_(email) {
  if (!email) return;
  const cache = CacheService.getScriptCache();
  const key = 'lead_' + email;
  if (cache.get(key)) {
    throw new Error('Please wait a few minutes before submitting again.');
  }
  cache.put(key, '1', CONFIG.RATE_LIMIT_SECONDS);
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function generateLeadId_(sheet) {
  const tz = Session.getScriptTimeZone();
  const datePart = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  const dataRows = Math.max(0, sheet.getLastRow() - 1);
  const seq = Utilities.formatString('%04d', dataRows + 1);
  return 'CHA-' + datePart + '-' + seq;
}

function getNotificationRecipients_() {
  const raw = CONFIG.EMAIL_RECIPIENTS;
  const list = Array.isArray(raw)
    ? raw
    : String(raw || '')
        .split(',')
        .map(function (e) {
          return e.trim();
        });
  return list.filter(function (e) {
    return e && e.indexOf('@') > 0;
  });
}

function getAgencyFooter_() {
  const officeLines = (CONFIG.OFFICES || []).map(function (o) {
    return '  ' + o.name + ': ' + o.phone + ' — ' + o.address;
  });
  return [
    '—',
    CONFIG.AGENCY_NAME || 'Chandler Hill Agency',
    CONFIG.AGENT_NAME ? 'Agent: ' + CONFIG.AGENT_NAME : '',
    CONFIG.WEBSITE_URL ? 'Website: ' + CONFIG.WEBSITE_URL : '',
    '',
    'Direct contact',
    '  Primary: ' + CONFIG.PHONE_NUMBER,
    '  Agency: ' + CONFIG.AGENCY_PHONE,
    '',
    'Office locations',
    officeLines.length ? officeLines.join('\n') : '  (none configured)',
    '',
    'Notification emails: ' + getNotificationRecipients_().join(', '),
    'Brand: ' + CONFIG.BRAND_ENTRY
  ]
    .filter(function (line) {
      return line !== '';
    })
    .join('\n');
}

function sendLeadNotification_(leadId, dateStr, timeStr, p) {
  const recipients = getNotificationRecipients_();
  if (!recipients.length) return;
  const subject = 'New Lead — ' + p.firstName + ' ' + p.lastName + ' (' + p.type + ') [' + leadId + ']';
  const referralBlock =
    p.heardAbout === 'Friend or Colleague'
      ? [
          '',
          'Referral details (gift card eligible if complete):',
          '  Referrer phone: ' + (formatPhoneDisplay_(p.referrerPhone) || '—'),
          '  Referrer email: ' + (p.referrerEmail || '—'),
          '  Referrer address: ' + (p.referrerAddress || '—')
        ].join('\n')
      : '';
  const body = [
    'New lead from ' + (CONFIG.WEBSITE_URL || 'chandlerhillagency.com'),
    '',
    'Lead ID: ' + leadId,
    'Date: ' + dateStr,
    'Time: ' + timeStr,
    'Brand: ' + CONFIG.BRAND_ENTRY,
    '',
    'Contact',
    '  Name: ' + p.firstName + ' ' + p.lastName,
    '  Email: ' + p.email,
    '  Phone: ' + formatPhoneDisplay_(p.phone),
    '',
    'Address',
    '  ' + [p.street, p.city, p.state, p.zip].filter(Boolean).join(', ') || '—',
    '',
    'Coverage',
    '  Insurance type: ' + (p.type || '—'),
    '  Car count: ' + (p.carCount || '—'),
    '  How they heard about us: ' + (p.heardAbout || '—'),
    referralBlock,
    '',
    getAgencyFooter_()
  ].join('\n');
  MailApp.sendEmail(recipients.join(','), subject, body);
}

function trim_(value, maxLen) {
  const s = String(value || '').trim();
  if (!maxLen) return s;
  return s.slice(0, maxLen);
}

function cleanPhone_(value) {
  return String(value || '').replace(/[^\d]/g, '').slice(0, 15);
}

function formatPhoneDisplay_(digits) {
  if (!digits) return '—';
  if (digits.length === 10) {
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  }
  return digits;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
