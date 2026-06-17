import { Router, RequestHandler } from 'express';
import passport from 'passport';
import {
  register, login, refreshToken, logout, getMe,
  sendOTPHandler, verifyOTPHandler, resetPassword, googleCallback,
  sendEmailOTP, verifyEmailOTP, checkAccountExists,
  sendPasswordResetOTP, resetPasswordWithOTP, debugCheckUser,
} from '../controllers/authController';
import { adminLogin } from '../controllers/adminAuthController';
import { authenticate } from '../middleware/auth';

const router = Router();
const auth   = authenticate as unknown as RequestHandler;

// ── Customer auth ───────────────────────────────────────────────────────────
router.post('/register',        register       as RequestHandler);
router.post('/login',           login          as RequestHandler);
router.post('/refresh',         refreshToken   as RequestHandler);
router.post('/logout',    auth, logout         as RequestHandler);
router.get('/me',         auth, getMe          as RequestHandler);

// ── Phone/SMS OTP (legacy generic system) ──────────────────────────────────
router.post('/otp/send',        sendOTPHandler   as RequestHandler);
router.post('/otp/verify',      verifyOTPHandler as RequestHandler);
router.post('/reset-password',  resetPassword    as RequestHandler);

// ── Email OTP — used by /verify-email after registration ───────────────────
router.post('/send-otp',        sendEmailOTP   as RequestHandler);
router.post('/verify-otp',      verifyEmailOTP as RequestHandler);

// ── Forgot password (email-based) — used by /forgot-password page ─────────
router.post('/check-account',              checkAccountExists    as RequestHandler);
router.post('/forgot-password/send-otp',   sendPasswordResetOTP  as RequestHandler);
router.post('/forgot-password/reset',      resetPasswordWithOTP  as RequestHandler);

// ── Admin login ──────────────────────────────────────────────────────────────
router.post('/admin/login',     adminLogin as RequestHandler);

// TEMPORARY — remove after debugging
router.post('/debug-check', debugCheckUser as RequestHandler);

// ── Google OAuth ─────────────────────────────────────────────────────────────
const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id');
const notConfigured: RequestHandler = (_req, res) =>
  res.status(503).json({ success: false, message: 'Google OAuth is not configured.' });

router.get('/google',          googleEnabled ? passport.authenticate('google', { scope: ['profile','email'] }) : notConfigured);
router.get('/google/callback', googleEnabled ? passport.authenticate('google', { session:false, failureRedirect:`${process.env.FRONTEND_URL}/login?error=google_failed` }) : notConfigured, googleCallback as RequestHandler);

export default router;
