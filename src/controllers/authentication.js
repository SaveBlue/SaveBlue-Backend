const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');


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
        .then(data => {
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
            res.status(200).json({"JWT Token": user.generateJWT()});
        } else {
            res.status(401).json(info);
        }
    })(req, res);

};
