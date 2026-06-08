import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { v4 as uuidv4 } from 'uuid';

export function configurePassport() {
  const googleConfigured =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret';

  if (!googleConfigured) {
    console.warn('⚠️  Google OAuth not configured — /api/auth/google will return 503 until you add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to .env');
    // Register a dummy strategy so passport doesn't throw "Unknown strategy"
    passport.use('google', new (require('passport-local').Strategy)(
      { usernameField: 'noop', passwordField: 'noop', passReqToCallback: false },
      (_u: any, _p: any, done: any) => done(null, false)
    ));
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;

      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      if (email) {
        user = await User.findOne({ email });
        if (user) {
          await User.findByIdAndUpdate(user._id, { googleId: profile.id, avatar: avatar || user.avatar, isVerified: true });
          return done(null, user);
        }
      }

      user = await User.create({ googleId: profile.id, email, name: profile.displayName || 'Google User', avatar, isVerified: true, isActive: true });
      await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
      return done(null, user);
    } catch (err) { return done(err as Error, undefined); }
  }));

  passport.serializeUser((user: any, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try { done(null, await User.findById(id)); } catch (e) { done(e, null); }
  });
}