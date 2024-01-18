import mongoose from 'mongoose';
import passport from 'passport';
import draftsAccount from '../services/draftsAccount.js';

const User = mongoose.model('User');
const Token = mongoose.model('Token');

// Register a new user
const register = async (req, res) => {

    // Validate request
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({message: "All data must be present"});
    } else if (!(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(req.body.email))) {
        return res.status(400).json({message: "Email address is not valid!"});
    }

    // Check lengths of fields
    if (req.body.username.length > 32 || req.body.password.length > 128 || req.body.email.length > 128) {
        return res.status(400).json({
            message: "Field too long."
        });
    }

    try {
        // Create a new user
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            accounts: []
        });
        newUser.hashPassword(req.body.password);

        // Save new User in the database
        const data = await newUser.save(newUser);

        // Create drafts account
        data.draftsAccount = await draftsAccount.create(data._id);

        res.send(data);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while creating new user!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Login to user account
const login = async (req, res) => {

    // Validate request
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: "All data required!"});
    }

    try {
        // Authenticate using Passport
        const {error, user, info} = await authenticateUser(req, res);

        if (error) {
            throw error;
        }

        if (!user) {
            res.status(401).json(info);
        }

        let JWT = user.generateJWT();
        let newToken = new Token({token: JWT});

        // Save jwt to whitelist
        await newToken.save(newToken);

        res.status(200).json({"x-access-token": JWT});

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred during login!"
        });
    }
};

// Helper function to wrap Passport authentication in a Promise
function authenticateUser(req, res) {
    return new Promise((resolve, reject) => {
        passport.authenticate('local', (error, user, info) => {

            if (error) {
                reject(error);
            } else {
                resolve({error, user, info});
            }

        })(req, res);
    });
}

//----------------------------------------------------------------------------------------------------------------------

// Invalidates JWT from whitelist
const logout = async (req, res) => {
    try {
        // Clear expired jwt from whitelist for housekeeping
        const deleteTokens = require('../CRON/clearExpiredTokens');
        deleteTokens.deleteExpiredTokens();

        // Delete the specific token
        const token = await Token.deleteOne({'token': req.headers["x-access-token"]});

        if (!token) {
            return res.status(404).json({
                message: "Token does not exist!"
            });
        }

        res.status(200).json({
            message: "Logged out!"
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while logging out!"
        });
    }
};

export default {
    register,
    login,
    logout
}
