const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const draftsAccount = require('../services/draftsAccount');


// Register a new user
exports.register = (req, res) => {

    // Validate request
    if (!req.body.username || !req.body.password ||  !req.body.email) {
        return res.status(400).json({message: "All data must be present"});
    }
    else if (!(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(req.body.email))) {
        return res.status(400).json({message: "Email address is not valid!"});
    }

    // Check lengths of fields
    if (req.body.username.length > 32 || req.body.password.length > 128 || req.body.email.length > 128) {
        return res.status(413).json({
            message: "Field too long."
        });
    }

    // Create a new user
    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        accounts: []
    });
    newUser.hashPassword(req.body.password)

    // Save new User in the database
    newUser
        .save(newUser)
        .then(async data => {
            // Create drafts account
            let createdDraftsAccount = await draftsAccount.create(data._id)
            data.draftsAccount = createdDraftsAccount
            res.send(data);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while creating new user!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Login to user account
exports.login = (req, res) => {

    // Validate request
    if (!req.body.username|| !req.body.password) {
        return res.status(400).json({message : "All data required!"});
    }

    // Passport authentication
    passport.authenticate('local',  (error, user, info) =>{
        if (error)
            return res.status(500).json(error);
        if (user) {

            let JWT = user.generateJWT();

            let newToken = new Token({token: JWT});

            // Save jwt to whitelist
            newToken.save(newToken)
                .then(() => {
                    res.status(200).json({"x-access-token": JWT});
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while saving token!"
                    });
                });


        } else {
            res.status(401).json(info);
        }
    })(req, res);

};
//----------------------------------------------------------------------------------------------------------------------


// invalidates JWT from whitelist
exports.logout = async (req, res) => {

    //clear expired jwt from whitelist for heroku ciganjenje
    const deleteTokens = require('../CRON/clearExpiredTokens')
    await deleteTokens.deleteExpiredTokens();

    Token.deleteOne({'token': req.headers["x-access-token"]})
        .then(token => {
            if (!token) {
                return res.status(404).json({
                    message: "Token does not exist!"
                });
            }

            res.status(200).json({
                message: "Logged out!"
            });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while logging out!"
            });
        });
};
