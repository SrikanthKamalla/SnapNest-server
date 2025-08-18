import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const strategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
};

const verifyCb = async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      // generate a dummy password for OAuth users
      const salt = await bcrypt.genSalt(10);
      const randomPassword = crypto.randomBytes(20).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        password: hashedPassword,
        isOAuth: true,
        authProvider: profile.provider,
        profilePic: profile.photos[0]?.value || null,
      });
    }

    done(null, user);
  } catch (error) {
    console.error("Google Auth Error:", error);
    done(error, null);
  }
};

passport.use(new GoogleStrategy(strategyOptions, verifyCb));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
