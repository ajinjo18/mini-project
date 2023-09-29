const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const registercollection = require('../model/registerSchema')


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback', // Adjust the callback URL as needed
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user already exists in the database by their Google ID
          const existingUser = await registercollection.findOne({ email: profile.emails[0].value });
  
          if (existingUser) {
            // User already exists, return the existing user
            return done(null, existingUser);
          }
  
          // User does not exist, create a new user record in MongoDB
          const newUser = {
              name: profile.displayName,
              email: profile.emails[0].value, // Assuming you requested the 'email' scope
              password: profile.emails[0].value,
              blocked:'false'
          }

          await registercollection.insertMany([newUser])
  
          // Return the newly created user
          done(null, newUser, { name: profile.displayName });
          
        } catch (error) {
          // Handle any errors that occur during database operations
          done(error, null);
        }
      }
    )
  );
passport.serializeUser((user, done) => {
  // Serialize user information (e.g., store user ID in the session)
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // Deserialize user information (e.g., retrieve user data from the session)
  done(null, user);
});

module.exports = passport;
