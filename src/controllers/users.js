const mongoose = require('mongoose');
const User = mongoose.model('User');
const deleteUserEntries = require('../services/deleteUserEntries');


// Return calling user data
exports.returnMe = (req, res) => {
    User.findById(req.params.tokenId, 'username firstName lastName email')
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            res.status(200).json(user);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching user!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Find a user with requested id
exports.findByID = (req, res) => {
    User.findById(req.params.id, 'username email')
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            res.status(200).json(user);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching user!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Delete user's account with the requested id in the request
exports.delete = (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(async user => {
            if (!user) {
                return res.status(404).send({
                    message: `No user with selected ID!`
                });
            }

            // Delete user's incomes from db
            try {
                await deleteUserEntries.deleteIncomes("userID", req.params.id);
            }catch (err){
                return res.status(500).send({message: err});
            }

            // Delete user's expenses from db
            try {
                await deleteUserEntries.deleteExpenses("userID", req.params.id);
            }catch (err){
                return res.status(500).send({message: err});
            }

            res.send({message: "User deleted!"});

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting user!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Update user data of the user with requested id
exports.update = (req, res) => {

    // Check lengths of fields
    if ((req.body.username && req.body.username.length > 32) || (req.body.password && req.body.password.length > 128) || (req.body.email && req.body.email.length > 128)) {
        return res.status(413).json({
            message: "Field too long."
        });
    }

    User.findById(req.params.id, 'username email hashedPassword salt')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }

            if (req.body.username)
                user.username = req.body.username;

            // Check email
            if (req.body.email)
                if ((/(?:[a-z0-9!#$%&'+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(req.body.email)))
                    user.email = req.body.email;
                else
                    return res.status(400).json({message: "Email address is not valid!"});

            if (req.body.password)
                user.hashPassword(req.body.password);

            // Save updated user data
            user.save()
                .then(() => {
                    res.status(200).json({"JWT": user.generateJWT()})
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while updating user!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while updating user!"
            });
        });
};
