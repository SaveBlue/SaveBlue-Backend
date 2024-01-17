const mongoose = require('mongoose');
const Token = mongoose.model('Token');

// invalidates JWT from whitelist
exports.deleteExpiredTokens = async () => {

    try {
        // Query for clearing expired tokens from the whitelist           hour min  sec  millis
        const result = await Token.deleteMany({'date': {$lt: Date.now() - 24 * 60 * 60 * 1000}});

        if (result.deletedCount === 0) {
            console.log("No tokens to delete!");
            return;
        }

        console.log("Whitelist cleared!");
        console.log(result);
    } catch (error) {
        console.log(error.message || "An error occurred while clearing expired whitelist!");
    }
};