import express from 'express';
import { RequestHandler } from 'express';
import * as authController from '../controllers/authController';
import passport from 'passport';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

router.post('/send-otp', authController.sendEmailOTP);
router.post('/verify-otp', authController.verifyEmailOTP);
router.post('/check-account', authController.checkAccountExists);

router.post('/send-reset-otp', authController.sendPasswordResetOTP);
router.post('/reset-password-otp', authController.resetPasswordWithOTP);

router.get('/debug-user', authController.debugCheckUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`,
  }),
  authController.googleCallback as RequestHandler
);

export default router;
