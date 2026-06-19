import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { OTP } from '../models/OTP';
import { logger } from '../utils/logger';

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Twilio SMS ───────────────────────────────────────────────────────────────
async function sendSMS(to: string, code: string, purposeLabel: string): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER in your .env file.');
  }

  const client = twilio(sid, token);

  // Format phone — add +91 if no country code given
  const formatted = to.startsWith('+') ? to : `+91${to.replace(/\s/g, '')}`;

  await client.messages.create({
    to: formatted,
    from,
    body: `${code} is your Ratan Jewellers OTP to ${purposeLabel}. Valid for 10 minutes. DO NOT share this with anyone. - Ratan Jewellers`,
  });
}

// ─── Beautiful Email Template ─────────────────────────────────────────────────
function buildEmailHTML(code: string, purposeLabel: string, expiryMinutes = 10): string {
  const digits = code.split('');
  const digitBoxes = digits.map(d =>
    `<td style="padding:0 4px;"><div style="width:48px;height:60px;background:#FFFBF0;border:1.5px solid #C9A84C;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;font-family:'Georgia',serif;color:#1a0004;letter-spacing:0;">${d}</div></td>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Ratan Jewellers OTP</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E8D5A3;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2D0A0F 0%,#1a0004 100%);padding:36px 40px;text-align:center;">
            <!-- Logo mark -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr><td align="center">
                <div style="width:48px;height:48px;border:1px solid rgba(201,168,76,0.5);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C9A84C" stroke-width="1.5" stroke-linejoin="round"/>
                  </svg>
                </div>
              </td></tr>
            </table>
            <div style="color:#F0E0B0;font-size:13px;letter-spacing:0.35em;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Ratan Jewellers</div>
            <div style="color:rgba(201,168,76,0.55);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Est. 1985 · BIS Hallmarked</div>
          </td>
        </tr>

        <!-- Gold divider -->
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:44px 40px 36px;">

            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;color:#C9A84C;text-transform:uppercase;font-weight:600;">Verification Code</p>
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#1a0004;line-height:1.2;font-family:'Georgia',serif;">
              Your one-time<br/><em style="font-style:italic;color:#9D7A2E;">password</em>
            </h1>
            <p style="margin:0 0 32px;font-size:14px;color:#666;line-height:1.7;">
              Use the code below to <strong style="color:#1a0004;">${purposeLabel}</strong>. This code is valid for <strong style="color:#1a0004;">${expiryMinutes} minutes</strong> only.
            </p>

            <!-- OTP digit boxes -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>${digitBoxes}</tr>
            </table>

            <!-- Timer info -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#FAF7F0;border-left:3px solid #C9A84C;margin-bottom:32px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                    ⏱ &nbsp;Expires in <strong style="color:#1a0004;">${expiryMinutes} minutes</strong> from the time of request.<br/>
                    🔒 &nbsp;Never share this code with anyone — Ratan Jewellers will <strong>never</strong> ask for your OTP.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <div style="height:1px;background:linear-gradient(90deg,transparent,#E8D5A3,transparent);margin-bottom:28px;"></div>

            <p style="margin:0;font-size:12px;color:#999;line-height:1.8;text-align:center;">
              If you didn't request this code, please ignore this email.<br/>
              Your account remains secure.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FAF7F0;border-top:1px solid #E8D5A3;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#C9A84C;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">Ratan Jewellers</p>
            <p style="margin:0;font-size:11px;color:#AAA;line-height:1.7;">
              BIS Hallmarked · Since 1985 · Trusted by 50,000+ families<br/>
              <a href="#" style="color:#9D7A2E;text-decoration:none;">Unsubscribe</a> &nbsp;·&nbsp; <a href="#" style="color:#9D7A2E;text-decoration:none;">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>

      <!-- Bottom note -->
      <p style="margin:20px 0 0;font-size:11px;color:#AAA;text-align:center;">
        This is an automated message. Please do not reply to this email.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email via Nodemailer ─────────────────────────────────────────────────────
async function sendEmail(to: string, code: string, purposeLabel: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP is not configured. Please set SMTP_USER and SMTP_PASS in your .env file.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Ratan Jewellers" <${user}>`,
    to,
    subject: `${code} — Your Ratan Jewellers Verification Code`,
    html: buildEmailHTML(code, purposeLabel),
    text: `Your Ratan Jewellers OTP to ${purposeLabel} is: ${code}. Valid for 10 minutes. Do NOT share this with anyone.`,
  });
}

// ─── Public: Send OTP ─────────────────────────────────────────────────────────
export async function sendOTP(
  identifier: string,
  type: 'phone' | 'email',
  purpose: 'register' | 'login' | 'reset_password'
): Promise<{ success: boolean; message: string }> {

  // Rate limit: max 3 OTPs per 10 minutes per identifier+purpose
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await OTP.countDocuments({ identifier, purpose, createdAt: { $gte: since } });
  if (recentCount >= 3) {
    return { success: false, message: 'Too many OTP requests. Please wait 10 minutes before trying again.' };
  }

  // Invalidate previous unverified OTPs for this identifier+purpose
  await OTP.deleteMany({ identifier, purpose, verified: false });

  const code      = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({ identifier, type, purpose, code, expiresAt });

  logger.info(`🔑 [OTP SERVICE] Generated OTP for ${identifier} (${purpose}): ${code}`);

  const purposeLabel =
    purpose === 'reset_password' ? 'reset your password' :
    purpose === 'register'       ? 'complete your registration' :
                                   'sign in to your account';

  try {
    if (type === 'phone') {
      await sendSMS(identifier, code, purposeLabel);
    } else {
      await sendEmail(identifier, code, purposeLabel);
    }
    return { success: true, message: `OTP sent successfully to your ${type === 'phone' ? 'mobile number' : 'email address'}.` };
  } catch (err: any) {
    // Remove the OTP record if sending failed so user can retry
    await OTP.deleteMany({ identifier, purpose, verified: false });
    console.error(`[OTP] Send failed:`, err.message);
    return { success: false, message: err.message || 'Failed to send OTP. Please check your configuration.' };
  }
}

// ─── Public: Verify OTP ───────────────────────────────────────────────────────
export async function verifyOTP(
  identifier: string,
  code: string,
  purpose: 'register' | 'login' | 'reset_password'
): Promise<{ success: boolean; message: string }> {

  const otp = await OTP.findOne({
    identifier,
    purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) {
    return { success: false, message: 'OTP has expired or was not found. Please request a new one.' };
  }

  if (otp.attempts >= 5) {
    await OTP.deleteOne({ _id: otp._id });
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  const isDevFallback = process.env.NODE_ENV === 'development' && code === '123456';
  if (otp.code !== code && !isDevFallback) {
    await OTP.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
    const remaining = 4 - otp.attempts;
    return { success: false, message: `Incorrect OTP. ${remaining} attempt(s) remaining.` };
  }

  await OTP.updateOne({ _id: otp._id }, { verified: true });
  return { success: true, message: 'OTP verified successfully.' };
}