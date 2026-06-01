import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const templates: Record<string, (data: any) => string> = {
  invoice: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a0a00, #3d1f00); padding: 30px; text-align: center;">
        <h1 style="color: #c9a84c; margin: 0;">Ratan Jewellers</h1>
        <p style="color: #e8d5a3; margin: 5px 0;">Your Invoice is Ready</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <p>Dear ${data.customerName},</p>
        <p>Thank you for your purchase! Your invoice <strong>${data.invoiceNumber}</strong> has been generated.</p>
        <div style="background: #f9f5e7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
          <p><strong>Total Amount:</strong> ₹${Number(data.totalAmount).toLocaleString('en-IN')}</p>
        </div>
        <a href="${data.pdfUrl}" style="display: inline-block; background: #c9a84c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Download Invoice PDF
        </a>
      </div>
      <div style="padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
        <p>Ratan Jewellers | ${process.env.COMPANY_ADDRESS}</p>
        <p>${process.env.COMPANY_PHONE} | ${process.env.COMPANY_EMAIL}</p>
      </div>
    </div>
  `,
  orderConfirmation: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a0a00, #3d1f00); padding: 30px; text-align: center;">
        <h1 style="color: #c9a84c;">Order Confirmed!</h1>
      </div>
      <div style="padding: 30px;">
        <p>Dear ${data.customerName},</p>
        <p>Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
        <p>Total: ₹${Number(data.totalAmount).toLocaleString('en-IN')}</p>
      </div>
    </div>
  `,
  birthday: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #c9a84c, #e8d5a3); padding: 40px; text-align: center;">
        <h1 style="color: #1a0a00;">Happy Birthday, ${data.customerName}! 🎂</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <p>As a special birthday gift, use code <strong>${data.couponCode}</strong> for ${data.discount}% off your next purchase!</p>
      </div>
    </div>
  `,
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const html = templates[options.template]?.(options.data) || `<p>${JSON.stringify(options.data)}</p>`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
  }
};
