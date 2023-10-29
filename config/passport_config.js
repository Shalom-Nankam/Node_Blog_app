const JwtStrategy = require("passport-jwt").Strategy;

const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../users/users.model");
require("dotenv").config();

const customOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(customOptions, async function (data, done) {
      const user = await User.findOne({
        email: data.email,
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
  );
};
