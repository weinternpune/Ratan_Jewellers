import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateInvoicePDF } from '../services/pdfService';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { sendEmail } from '../services/emailService';

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear(), month = String(new Date().getMonth()+1).padStart(2,'0');
  const count = await Invoice.countDocuments({ createdAt: { $gte: new Date(`${year}-${month}-01`) } });
  return `RJ-${year}${month}-${String(count+1).padStart(4,'0')}`;
};

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, customerName, customerPhone, customerEmail, customerAddress, customerGstin, items, paymentMode, discountAmount=0, oldGoldExchange=0, notes } = req.body;
    const invoiceNumber = await generateInvoiceNumber();
    let subtotal=0, totalCgst=0, totalSgst=0;
    const processedItems = items.map((item: any) => {
      const goldValue = item.netWeight * item.goldRate;
      const unitPrice = goldValue + item.makingCharges + item.stoneCharges;
      const base = unitPrice * item.quantity;
      const cgstAmount = base * (item.cgstRate || 1.5) / 100;
      const sgstAmount = base * (item.sgstRate || 1.5) / 100;
      subtotal += base; totalCgst += cgstAmount; totalSgst += sgstAmount;
      return { ...item, unitPrice, cgstAmount, sgstAmount, totalAmount: base+cgstAmount+sgstAmount };
    });
    const totalAmount = subtotal + totalCgst + totalSgst - discountAmount - oldGoldExchange;
    const invoice = await Invoice.create({ invoiceNumber, userId: req.user!.id, customerId: customerId||undefined, customerName, customerPhone, customerEmail, customerAddress, customerGstin, paymentMode, subtotal, discountAmount, cgst: totalCgst, sgst: totalSgst, totalAmount, oldGoldExchange, notes, items: processedItems });
    generateInvoicePDF(invoice).then(async pdfUrl => {
      await Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });
      if (customerPhone) await sendWhatsAppMessage({ invoiceId: invoice._id.toString(), phone: customerPhone, pdfUrl, customerName, invoiceNumber, totalAmount });
      if (customerEmail)  await sendEmail({ to: customerEmail, subject: `Invoice ${invoiceNumber} - Ratan Jewellers`, template: 'invoice', data: { customerName, invoiceNumber, totalAmount, pdfUrl } });
    }).catch(console.error);
    res.status(201).json({ success: true, message: 'Invoice created', data: invoice });
  } catch (err) { next(err); }
};

export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page='1', limit='20', search, startDate, endDate } = req.query;
    const pageNum = parseInt(page as string), limitNum = parseInt(limit as string);
    const filter: any = {};
    if (search) filter.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }, { customerPhone: { $regex: search } }];
    if (startDate || endDate) { filter.createdAt = {}; if (startDate) filter.createdAt.$gte = new Date(startDate as string); if (endDate) filter.createdAt.$lte = new Date(endDate as string); }
    const [invoices, total] = await Promise.all([Invoice.find(filter).sort({ createdAt: -1 }).skip((pageNum-1)*limitNum).limit(limitNum), Invoice.countDocuments(filter)]);
    res.json({ success: true, data: { invoices, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total/limitNum) } } });
  } catch (err) { next(err); }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First try to find by invoiceNumber, then by ObjectId
    let invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    if (!invoice) {
      invoice = await Invoice.findById(req.params.id);
    }
    
    if (!invoice) throw new AppError('Invoice not found', 404);
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

export const updateInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // First try to find by invoiceNumber, then by ObjectId
    let invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    if (!invoice) {
      invoice = await Invoice.findById(req.params.id);
    }
    
    if (!invoice) throw new AppError('Invoice not found', 404);
    
    const updateData = { ...req.body, isEdited: true };
    if (invoice.isEdited) {
      updateData.editHistory = [...(invoice.editHistory || []), { editedAt: new Date(), editedBy: req.user!.id, changes: req.body }];
    } else {
      updateData.editHistory = [{ editedAt: new Date(), editedBy: req.user!.id, changes: req.body }];
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(invoice._id, updateData, { new: true });
    res.json({ success: true, message: 'Invoice updated', data: updatedInvoice });
  } catch (err) { next(err); }
};

export const deleteInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Delete request for ID:', req.params.id);
    
    // First try to find by invoiceNumber, then by ObjectId
    let invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    console.log('Found by invoiceNumber:', invoice ? 'Yes' : 'No');
    
    if (!invoice) {
      console.log('Trying to find by ObjectId...');
      // Only try ObjectId if it looks like a valid ObjectId (24 hex characters)
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        invoice = await Invoice.findById(req.params.id);
        console.log('Found by ObjectId:', invoice ? 'Yes' : 'No');
      }
    }
    
    if (!invoice) {
      console.log('Invoice not found with ID:', req.params.id);
      throw new AppError('Invoice not found', 404);
    }
    
    console.log('Deleting invoice with MongoDB _id:', invoice._id);
    
    // Delete using the actual _id (ensure it's properly converted)
    const result = await Invoice.findByIdAndDelete(invoice._id);
    console.log('Delete result:', result ? 'Success' : 'Failed');
    
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) { 
    console.error('Delete invoice error:', err);
    next(err); 
  }
};

export const resendWhatsApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First try to find by invoiceNumber, then by ObjectId
    let invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    if (!invoice) {
      invoice = await Invoice.findById(req.params.id);
    }
    
    if (!invoice) throw new AppError('Invoice not found', 404);
    if (!invoice.pdfUrl) throw new AppError('PDF not yet generated', 400);
    await sendWhatsAppMessage({ invoiceId: invoice._id.toString(), phone: invoice.customerPhone, pdfUrl: invoice.pdfUrl, customerName: invoice.customerName, invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount });
    res.json({ success: true, message: 'WhatsApp message queued' });
  } catch (err) { next(err); }
};

export const getGSTSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(`${year}-${String(month).padStart(2,'0')}-01`);
    const endDate = new Date(startDate); endDate.setMonth(endDate.getMonth()+1);
    const result = await Invoice.aggregate([{ $match: { createdAt: { $gte: startDate, $lt: endDate } } }, { $group: { _id: null, totalSales: { $sum: '$subtotal' }, totalCgst: { $sum: '$cgst' }, totalSgst: { $sum: '$sgst' }, totalIgst: { $sum: '$igst' }, count: { $sum: 1 } } }]);
    const s = result[0] || { totalSales:0, totalCgst:0, totalSgst:0, totalIgst:0, count:0 };
    res.json({ success: true, data: { ...s, totalTax: s.totalCgst+s.totalSgst+s.totalIgst } });
  } catch (err) { next(err); }
};
