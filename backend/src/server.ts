import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { configurePassport } from './config/passport';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

import authRoutes      from './routes/auth';
import productRoutes   from './routes/products';
import categoryRoutes  from './routes/categories';
import inventoryRoutes from './routes/inventory';
import orderRoutes     from './routes/orders';
import invoiceRoutes   from './routes/invoices';
import customerRoutes  from './routes/customers';
import analyticsRoutes from './routes/analytics';
import goldRateRoutes  from './routes/goldRates';
import settingsRoutes  from './routes/settings';
import couponRoutes    from './routes/coupons';
import reviewRoutes    from './routes/reviews';
import wishlistRoutes  from './routes/wishlist';
import waRoutes        from './routes/whatsapp';
import supplierRoutes  from './routes/suppliers';
import uploadRoutes    from './routes/upload';
import customJewelleryRoutes from './routes/customJewellery';
import adminRoutes     from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

configurePassport();
app.use(passport.initialize());

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl, server-to-server, etc.
    if (process.env.NODE_ENV === 'production') return callback(null, origin === allowedOrigin);
    const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    callback(null, isLocalDev || origin === allowedOrigin);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use('/api/',      rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: process.env.NODE_ENV === 'development' ? 1000 : 20 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Ratan Jewellers API', db: 'MongoDB' }));

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/invoices',   invoiceRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/gold-rates', goldRateRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/whatsapp',   waRoutes);
app.use('/api/suppliers',  supplierRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/custom-jewellery', customJewelleryRoutes);
app.use('/api/admin',      adminRoutes);

app.use('*', (_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Ratan Jewellers API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🍃 Database: MongoDB`);
});

export default app;
