import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { v4 as uuidv4 } from 'uuid';

export function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.warn(
      'Google OAuth is not fully configured. ' +
      'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL.'
    );
  }

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: clientID || 'placeholder',
        clientSecret: clientSecret || 'placeholder',
        callbackURL:
          callbackURL ||
          'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value;

          let user = await User.findOne({
            googleId: profile.id,
          });

          if (user) {
            return done(null, user);
          }

          if (email) {
            user = await User.findOne({ email });

            if (user) {
              await User.findByIdAndUpdate(user._id, {
                googleId: profile.id,
                avatar: avatar || user.avatar,
                isVerified: true,
              });

              return done(null, user);
            }
          }

          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName || 'Google User',
            avatar,
            isVerified: true,
            isActive: true,
          });

          await Customer.create({
            userId: user._id,
            referralCode: uuidv4()
              .substring(0, 8)
              .toUpperCase(),
          });

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}