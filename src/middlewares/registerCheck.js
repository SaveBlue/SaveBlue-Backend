const mongoose = require('mongoose');
const User = mongoose.model('User');


exports.checkUniqueUsernameEmail = (req, res, next) => {

    //  Check username duplicates
    User.findOne({'username': req.body.username}, 'username')
        .then(username => {
            if (username) {
                return res.status(409).json({
                    message: "Duplicate username!"
                });
            }

            // Check email duplicates
            User.findOne({'email': req.body.email}, 'username')
                .then(email => {
                    if (email) {
                        return res.status(409).json({
                            message: "Duplicate email!"
                        });
                    }

                    // If both unique proceed
                    next();

                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while confirming unique email!"
                    });
                })

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while confirming unique username!"
            });
        });
};

