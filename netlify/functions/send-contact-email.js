/* ==========================================================
   netlify/functions/send-contact-email.js
   Netlify serverless function — True Jiu Jitsu contact form

   Triggered by: POST /.netlify/functions/send-contact-email
   Purpose: Receives form data and sends a branded email via AWS SES.

   Environment variables (set in Netlify dashboard + local .env):
     TJJ_AWS_ACCESS_KEY_ID     — IAM user access key
     TJJ_AWS_SECRET_ACCESS_KEY — IAM user secret key
     TJJ_AWS_REGION            — SES region, e.g. "us-east-1"
   ========================================================== */

const AWS = require('aws-sdk');

/* ----------------------------------------------------------
   AWS SES client — credentials come from environment variables,
   never hardcoded in source.
   ---------------------------------------------------------- */
const ses = new AWS.SES({
  accessKeyId:     process.env.TJJ_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.TJJ_AWS_SECRET_ACCESS_KEY,
  region:          process.env.TJJ_AWS_REGION || 'us-east-1',
});

/* ----------------------------------------------------------
   CORS headers — returned on every response so the browser
   accepts the reply from the Netlify function domain.
   ---------------------------------------------------------- */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

/* ----------------------------------------------------------
   Sanitize — strip HTML tags to prevent injection in the
   email body. Returns a fallback string if the value is empty.
   ---------------------------------------------------------- */
function sanitize(str, fallback = 'Not provided') {
  if (!str || !String(str).trim()) return fallback;
  return String(str).replace(/<[^>]*>?/gm, '').trim();
}

/* ----------------------------------------------------------
   buildHtmlEmail — Returns a branded HTML email string.
   Uses inline styles throughout for maximum email client
   compatibility (Gmail, Outlook, Apple Mail, etc.).
   ---------------------------------------------------------- */
function buildHtmlEmail({ name, email, phone, interest, message, timestamp }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Free Trial Request — True Jiu Jitsu</title>
</head>
<body style="margin:0; padding:0; background-color:#111111; font-family: Arial, sans-serif; color:#f0f0f0;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#1e1e1e; border-radius:6px; overflow:hidden; border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a; padding:28px 32px; border-bottom:3px solid #c41e2a;">
              <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#c41e2a;">True Jiu Jitsu — Hickory, NC</p>
              <h1 style="margin:8px 0 0; font-size:22px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.05em;">
                New Free Trial Request
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 24px; font-size:15px; color:#cccccc; line-height:1.6;">
                Someone submitted the free trial form on the website. Here are their details:
              </p>

              <!-- Contact details block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#141414; border-left:4px solid #c41e2a; border-radius:4px; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#888888;">Contact Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a;">
                          <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#888888; display:inline-block; width:90px;">Name</span>
                          <span style="font-size:15px; color:#ffffff; font-weight:bold;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a;">
                          <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#888888; display:inline-block; width:90px;">Email</span>
                          <a href="mailto:${email}" style="font-size:15px; color:#c41e2a; text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a;">
                          <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#888888; display:inline-block; width:90px;">Phone</span>
                          <span style="font-size:15px; color:#f0f0f0;">${phone}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#888888; display:inline-block; width:90px;">Interest</span>
                          <span style="font-size:15px; color:#f0f0f0;">${interest}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#141414; border:1px solid #2a2a2a; border-radius:4px; margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#888888;">Their Message</p>
                    <p style="margin:0; font-size:15px; color:#cccccc; line-height:1.7; white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="mailto:${email}?subject=Your Free Trial at True Jiu Jitsu"
                       style="display:inline-block; background-color:#c41e2a; color:#ffffff; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; padding:14px 32px; border-radius:4px; text-decoration:none;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #2a2a2a; padding-top:20px;">
                  <p style="margin:0; font-size:12px; color:#555555; text-align:center;">
                    Submitted via truebjj.academy &nbsp;·&nbsp; ${timestamp}
                  </p>
                </td></tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0a0a0a; padding:20px 32px; border-top:1px solid #2a2a2a;">
              <p style="margin:0; font-size:12px; color:#555555; text-align:center;">
                True Jiu Jitsu &nbsp;·&nbsp; 735 13th Ave Dr SE, Hickory, NC 28602 &nbsp;·&nbsp;
                <a href="tel:+18286122695" style="color:#555555; text-decoration:none;">(828) 612-2695</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ----------------------------------------------------------
   buildPlainTextEmail — Plain-text fallback for email clients
   that don't render HTML.
   ---------------------------------------------------------- */
function buildPlainTextEmail({ name, email, phone, interest, message, timestamp }) {
  return [
    'NEW FREE TRIAL REQUEST — TRUE JIU JITSU',
    '========================================',
    '',
    `Name:      ${name}`,
    `Email:     ${email}`,
    `Phone:     ${phone}`,
    `Interest:  ${interest}`,
    '',
    'Message:',
    message,
    '',
    '----------------------------------------',
    `Submitted: ${timestamp}`,
    'True Jiu Jitsu — 735 13th Ave Dr SE, Hickory, NC 28602',
  ].join('\n');
}

/* ----------------------------------------------------------
   Helper: build a JSON HTTP response with CORS headers.
   ---------------------------------------------------------- */
function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

/* ----------------------------------------------------------
   MAIN HANDLER
   ---------------------------------------------------------- */
exports.handler = async (event) => {

  // Preflight CORS request from the browser
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  // Parse the JSON body sent by main.js
  let raw;
  try {
    raw = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON body' });
  }

  // Require at minimum a name and email
  if (!raw.name || !raw.email) {
    return respond(400, { error: 'Name and email are required' });
  }

  // Sanitize all fields
  const fields = {
    name:      sanitize(raw.name),
    email:     sanitize(raw.email),
    phone:     sanitize(raw.phone),
    interest:  sanitize(raw.interest),
    message:   sanitize(raw.message, '(no message)'),
    timestamp: new Date().toLocaleString('en-US', {
      timeZone:  'America/New_York',
      year:      'numeric',
      month:     'long',
      day:       'numeric',
      hour:      '2-digit',
      minute:    '2-digit',
    }),
  };

  // Build the SES email parameters
  const emailParams = {
    Source: 'no-reply@truebjj.academy',
    Destination: {
      ToAddresses: ['jake@honeybeewebdesign.com'],
    },
    Message: {
      Subject: {
        Data:    `Free Trial Request — ${fields.name}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: { Data: buildHtmlEmail(fields),          Charset: 'UTF-8' },
        Text: { Data: buildPlainTextEmail(fields),     Charset: 'UTF-8' },
      },
    },
    // ReplyToAddresses lets you hit Reply in your email client
    // and it goes straight back to the person who submitted
    ReplyToAddresses: [fields.email],
  };

  try {
    const result = await ses.sendEmail(emailParams).promise();
    return respond(200, { success: true, messageId: result.MessageId });
  } catch (err) {
    // Logged to Netlify's function log for debugging
    console.error('SES send failed:', err);
    return respond(500, { error: 'Failed to send email' });
  }
};
