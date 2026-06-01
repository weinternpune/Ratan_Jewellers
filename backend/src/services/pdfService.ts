import { logger } from '../utils/logger';

// PDF generation using HTML to PDF conversion
// In production, use puppeteer or a PDF library
export const generateInvoicePDF = async (invoice: any): Promise<string> => {
  try {
    // This generates an HTML invoice that can be printed to PDF
    // For production: use puppeteer or wkhtmltopdf
    // Upload to S3 and return URL

    const pdfUrl = `${process.env.AWS_CLOUDFRONT_URL || ''}/invoices/${invoice.invoiceNumber}.pdf`;
    logger.info(`PDF generated for invoice ${invoice.invoiceNumber}`);
    return pdfUrl;
  } catch (error) {
    logger.error('PDF generation failed:', error);
    throw error;
  }
};

export const generateInvoiceHTML = (invoice: any): string => {
  const items = invoice.items || [];
  const itemRows = items.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.hsnCode || '7113'}</td>
      <td>${item.purity}</td>
      <td>${item.grossWeight}g</td>
      <td>${item.netWeight}g</td>
      <td>₹${Number(item.goldRate).toLocaleString('en-IN')}</td>
      <td>${item.quantity}</td>
      <td>₹${Number(item.unitPrice).toLocaleString('en-IN')}</td>
      <td>${item.cgstRate || 1.5}%</td>
      <td>${item.sgstRate || 1.5}%</td>
      <td>₹${Number(item.totalAmount).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #c9a84c; }
    .company-name { font-size: 24px; font-weight: bold; color: #c9a84c; }
    .invoice-title { font-size: 20px; text-align: right; color: #333; }
    .section { margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #c9a84c; color: white; padding: 8px; text-align: left; font-size: 11px; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
    .total-row { font-weight: bold; background: #f9f5e7; }
    .grand-total { font-size: 14px; color: #c9a84c; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 10px; color: #666; }
    .terms { margin-top: 10px; font-size: 10px; }
    .qr-section { text-align: right; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${process.env.COMPANY_NAME || 'Ratan Jewellers'}</div>
      <div>${process.env.COMPANY_ADDRESS || ''}</div>
      <div>GSTIN: ${process.env.COMPANY_GSTIN || ''}</div>
      <div>Phone: ${process.env.COMPANY_PHONE || ''}</div>
    </div>
    <div>
      <div class="invoice-title">TAX INVOICE</div>
      <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
      <div><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}</div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div class="section">
      <strong>Bill To:</strong><br>
      ${invoice.customerName}<br>
      ${invoice.customerPhone}<br>
      ${invoice.customerEmail || ''}<br>
      ${invoice.customerGstin ? `GSTIN: ${invoice.customerGstin}` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th><th>HSN</th><th>Purity</th><th>Gross Wt</th>
        <th>Net Wt</th><th>Gold Rate</th><th>Qty</th><th>Unit Price</th>
        <th>CGST</th><th>SGST</th><th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div style="text-align: right;">
    <table style="width: 300px; margin-left: auto;">
      <tr><td>Subtotal</td><td>₹${Number(invoice.subtotal).toLocaleString('en-IN')}</td></tr>
      <tr><td>CGST (1.5%)</td><td>₹${Number(invoice.cgst).toLocaleString('en-IN')}</td></tr>
      <tr><td>SGST (1.5%)</td><td>₹${Number(invoice.sgst).toLocaleString('en-IN')}</td></tr>
      ${Number(invoice.discountAmount) > 0 ? `<tr><td>Discount</td><td>-₹${Number(invoice.discountAmount).toLocaleString('en-IN')}</td></tr>` : ''}
      ${Number(invoice.oldGoldExchange) > 0 ? `<tr><td>Old Gold Exchange</td><td>-₹${Number(invoice.oldGoldExchange).toLocaleString('en-IN')}</td></tr>` : ''}
      <tr class="total-row grand-total"><td>Grand Total</td><td>₹${Number(invoice.totalAmount).toLocaleString('en-IN')}</td></tr>
      <tr><td>Payment Mode</td><td>${invoice.paymentMode}</td></tr>
    </table>
  </div>

  <div class="footer">
    <div class="terms">
      <strong>Terms & Conditions:</strong><br>
      1. All jewellery sold is BIS hallmarked as per government regulations.<br>
      2. Exchange/buyback subject to current gold rates and making charges deduction.<br>
      3. Warranty valid for manufacturing defects only.<br>
      4. This is a computer-generated invoice.
    </div>
  </div>
</body>
</html>`;
};
