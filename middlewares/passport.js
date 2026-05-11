const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
        console.log('Profile: ', profile)
        let user = await userModel.findOne({ email: profile._json.email });
        
        if (!user) {
          user = new userModel({
            fullName: profile._json.name,
            phoneNumber: `${Math.floor(Math.random() * 1E9)}`,
            email: profile._json.email,
            isVerified: profile._json.email_verified,
            password: ' ',
            profilePicture: profile._json.picture
          })
          await user.save()
        }

        return cb(null, user)
        
    } catch (error) {
        return cb(null, error)
    }
  }
));

passport.serializeUser((user, cb) => {
  console.log(user)
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  // console.log(id)
  const user = await userModel.findById(id)

  if (!user) {
    return cb(new Error('User not found'), null)
  }
  cb(null, user)
});

const profile = passport.authenticate('google', {scope: ['profile', 'email'] })

const loginProfile = passport.authenticate('google', { failureRedirect: '/login' })

module.exports = {passport, profile, loginProfile }