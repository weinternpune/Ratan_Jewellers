import { Router, RequestHandler } from 'express';
import passport from 'passport';
import {
  register, login, refreshToken, logout, getMe,
  sendOTPHandler, verifyOTPHandler, resetPassword, googleCallback
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Cast authenticate to plain RequestHandler to avoid AuthRequest vs Request conflict
const auth = authenticate as unknown as RequestHandler;

// Standard auth
router.post('/register', register as RequestHandler);
router.post('/login',    login    as RequestHandler);
router.post('/refresh',  refreshToken as RequestHandler);
router.post('/logout',   auth, logout  as RequestHandler);
router.get('/me',        auth, getMe   as RequestHandler);

// OTP auth
router.post('/otp/send',       sendOTPHandler   as RequestHandler);
router.post('/otp/verify',     verifyOTPHandler as RequestHandler);
router.post('/reset-password', resetPassword    as RequestHandler);

// Google OAuth — returns 503 if not configured
const googleNotConfigured: RequestHandler = (_req, res) => {
  res.status(503).json({ success: false, message: 'Google OAuth is not configured on this server. Please use Mobile OTP or Email/Password to sign in.' });
};
const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id');

router.get('/google',
  googleEnabled
    ? passport.authenticate('google', { scope: ['profile', 'email'] })
    : googleNotConfigured
);
router.get('/google/callback',
  googleEnabled
    ? passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed` })
    : googleNotConfigured,
  googleCallback as RequestHandler
);

export default router;