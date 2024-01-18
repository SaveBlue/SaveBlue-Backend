import mongoose from 'mongoose';

const User = mongoose.model('User');

const checkUniqueUsernameEmail = async (req, res, next) => {
    try {
        // Check username duplicates
        const usernameExists = await User.findOne({ 'username': req.body.username }, 'username');

        if (usernameExists) {
            return res.status(409).json({
                message: "Duplicate username!"
            });
        }

        // Check email duplicates
        const emailExists = await User.findOne({ 'email': req.body.email }, 'username');

        if (emailExists) {
            return res.status(409).json({
                message: "Duplicate email!"
            });
        }

        // If both unique, proceed
        next();

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while confirming uniqueness!"
        });
    }
};

export default {
    checkUniqueUsernameEmail
};