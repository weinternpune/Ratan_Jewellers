import { Router, RequestHandler } from 'express';
import passport from 'passport';

import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  sendOTPHandler,
  verifyOTPHandler,
  resetPassword,
  sendEmailOTP,
  verifyEmailOTP,
  checkAccountExists,
  sendPasswordResetOTP,
  resetPasswordWithOTP,
  googleCallback
} from '../controllers/authController';

import { authenticate } from '../middleware/auth';
const router = Router();
const auth = authenticate as unknown as RequestHandler;

// ── Customer auth ───────────────────────────────────────────────────────────
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/refresh', refreshToken as RequestHandler);
router.post('/logout', auth, logout as RequestHandler);
router.get('/me', auth, getMe as RequestHandler);

// ── Phone/SMS OTP ───────────────────────────────────────────────────────────
router.post('/otp/send', sendOTPHandler as RequestHandler);
router.post('/otp/verify', verifyOTPHandler as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

// ── Email OTP ───────────────────────────────────────────────────────────────
router.post('/send-otp', sendEmailOTP as RequestHandler);
router.post('/verify-otp', verifyEmailOTP as RequestHandler);

// ── Forgot Password ─────────────────────────────────────────────────────────
router.post('/check-account', checkAccountExists as RequestHandler);
router.post('/forgot-password/send-otp', sendPasswordResetOTP as RequestHandler);
router.post('/forgot-password/reset', resetPasswordWithOTP as RequestHandler);

// ── Admin Login ─────────────────────────────────────────────────────────────
// router.post('/admin/login', adminLogin as RequestHandler);

// TEMPORARY — remove after debugging
router.get('/create-test-user', (async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { User } = require('../models/User');
    
    const testEmail = 'uttamkumar86830@gmail.com';
    const testPassword = 'SuperAdmin@2025#RJ';
    
    // Check if user already exists
    const existing = await User.findOne({ email: testEmail });
    if (existing) {
      return res.json({ success: true, message: 'User already exists! You can login now.', email: testEmail, password: testPassword });
    }
    
    // Create new user
    const hash = await bcrypt.hash(testPassword, 12);
    const user = await User.create({
      name: 'Uttam Kumar',
      email: testEmail,
      phone: '+917507510948',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      isActive: true,
      isVerified: true
    });
    
    res.json({ 
      success: true, 
      message: 'Test user created successfully!', 
      user: { id: user._id, email: user.email, role: user.role },
      credentials: { email: testEmail, password: testPassword }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}) as RequestHandler);

// ── Google OAuth ────────────────────────────────────────────────────────────
const googleGuard: RequestHandler = (req, res, next) => {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;

  if (!id || id === 'your_google_client_id' || !secret) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.',
    });
  }

  next();
};

router.get(
  '/google',
  googleGuard,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  googleGuard,
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`,
  }),
  googleCallback as RequestHandler
);

export default router;