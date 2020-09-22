const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(
    new LocalStrategy(

        (userName, pass, PassCheckResult) => {
            User.findOne(
                { username: userName }, 'username hashedPassword salt',
                (error, user) => {
                    if (error)
                        return PassCheckResult(error);
                    if (!user || !user.checkPassword(pass)) {
                        return PassCheckResult(null, false, {
                            message: "Wrong username or password!"
                        });
                    }
                    return PassCheckResult(null, user);
                }
            );
        }
    )
);

