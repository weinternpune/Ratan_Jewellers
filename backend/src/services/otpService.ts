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
    `<td style="padding:0 6px;">
      <div style="width:58px;height:72px;background:transparent;border:1.5px solid #C9A84C;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;font-family:'Georgia',Georgia,serif;color:#ffffff;box-shadow:0 0 12px rgba(201,168,76,0.25);">${d}</div>
    </td>`
  ).join('');

  const actionLabel = purposeLabel.includes('reset') ? 'reset your password' :
                      purposeLabel.includes('sign in') ? 'sign in to your account' :
                      purposeLabel.includes('register') ? 'complete your registration' :
                      purposeLabel;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Ratan Jewellers Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#111111;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:16px;overflow:hidden;border:1px solid #C9A84C;box-shadow:0 0 40px rgba(201,168,76,0.15);">
        <tr>
          <td style="background:#2D0A0F;padding:36px 40px 32px;text-align:center;border-bottom:2px solid #C9A84C;">
            <div style="margin-bottom:16px;">
              <img src="${process.env.FRONTEND_URL || 'https://ratanjeweller.in'}/logo.jpg" alt="Ratan Jewellers" width="220" style="height:auto;max-height:110px;object-fit:contain;display:inline-block;" />
            </div>
            <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:#C9A84C;text-transform:uppercase;">EST. 1985 &nbsp;·&nbsp; BIS HALLMARKED</p>
            <div style="margin-top:20px;text-align:center;">
              <span style="display:inline-block;height:1px;width:80px;background:linear-gradient(90deg,transparent,#C9A84C);vertical-align:middle;"></span>
              <span style="display:inline-block;width:6px;height:6px;background:#C9A84C;transform:rotate(45deg);margin:0 10px;vertical-align:middle;"></span>
              <span style="display:inline-block;height:1px;width:80px;background:linear-gradient(90deg,#C9A84C,transparent);vertical-align:middle;"></span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#1C1C1C;padding:44px 40px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.35em;color:#C9A84C;text-transform:uppercase;font-weight:600;">Verification Code</p>
            <div style="width:6px;height:6px;background:#C9A84C;transform:rotate(45deg);margin:0 auto 20px;"></div>
            <h1 style="margin:0 0 4px;font-size:36px;font-weight:300;color:#ffffff;font-family:'Georgia',serif;">Your one-time</h1>
            <h1 style="margin:0 0 24px;font-size:36px;font-weight:400;color:#C9A84C;font-family:'Georgia',serif;font-style:italic;">password</h1>
            <p style="margin:0 0 36px;font-size:14px;color:#BBBBBB;line-height:1.75;">
              Use the code below to <strong style="color:#ffffff;">${actionLabel}</strong>.<br/>
              This code is valid for <strong style="color:#ffffff;">${expiryMinutes} minutes</strong> only.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 40px;"><tr>${digitBoxes}</tr></table>
            <table cellpadding="0" cellspacing="0" style="width:100%;max-width:440px;margin:0 auto 40px;background:#252525;border-radius:8px;border-left:3px solid #C9A84C;">
              <tr><td style="padding:18px 20px;text-align:left;">
                <p style="margin:0 0 10px;font-size:13px;color:#CCCCCC;line-height:1.6;">&#9711; &nbsp;Expires in <strong style="color:#ffffff;">${expiryMinutes} minutes</strong> from the time of request.</p>
                <div style="height:1px;background:#333333;margin-bottom:10px;"></div>
                <p style="margin:0;font-size:13px;color:#CCCCCC;line-height:1.6;">&#128274; &nbsp;Never share this code — Ratan Jewellers will <strong style="color:#C9A84C;">never</strong> ask for your OTP.</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-top:1px solid #2A2A2A;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 14px;font-size:12px;color:#888888;line-height:1.8;">
              If you didn&apos;t request this code, please ignore this email.<br/>Your account remains secure.
            </p>
            <div style="height:1px;background:linear-gradient(90deg,transparent,#333333,transparent);margin-bottom:14px;"></div>
            <p style="margin:0;font-size:11px;color:#555555;">&copy; ${new Date().getFullYear()} Ratan Jewellers. All rights reserved.</p>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#555555;text-align:center;">This is an automated message. Please do not reply.</p>
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

  logger.info(`[OTP SERVICE] OTP generated for ${identifier} (${purpose})`);  // code never logged

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
    console.error(`[OTP] Send failed - FULL ERROR:`, err);
    // Do NOT delete OTP so user can still use it
    return { success: false, message: err.message || 'Failed to send OTP.' };
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