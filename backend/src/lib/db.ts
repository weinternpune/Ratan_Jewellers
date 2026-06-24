import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ratan_jewellers';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    isConnected = true;
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => { logger.warn('MongoDB disconnected'); isConnected = false; });
mongoose.connection.on('error', (err) => { logger.error('MongoDB error:', err); });

export default connectDB;
