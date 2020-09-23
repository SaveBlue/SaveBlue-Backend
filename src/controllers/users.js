const mongoose = require('mongoose');
const User = mongoose.model('User');

// Find a user with an id
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

// Delete user's account with the specified id in the request
exports.delete = (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(user => {
            if (!user) {
                res.status(404).send({
                    message: `No user with selected ID!`
                });
            } else {
                res.send({
                    message: "User deleted!"
                });
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting user!"
            });
        });
};

// Update user's data by the id in the request
exports.update = (req, res) => {
    console.log(req.body);

    User.findById({_id: req.params.id}, 'username email hashedPassword salt')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }

            console.log(user)

            if(req.body.username)
                user.username = req.body.username;

            // check for correct form of email if it is to be updated
            if(req.body.email)
                if((/(?:[a-z0-9!#$%&'+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(req.body.email)))
                    user.email = req.body.email;
                else
                    return res.status(400).json({message: "Email address is not valid!"});

            if(req.body.password)
                user.hashPassword(req.body.password);

            // save updated user data
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
