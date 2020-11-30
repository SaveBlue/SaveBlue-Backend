const mongoose = require('mongoose');
const Token = mongoose.model('Token');

// invalidates JWT from whitelist
exports.deleteExpiredTokens = () => {

    //query for clearing whitelist               hour min  sec  millis
    Token.deleteMany({'date': {$lt: Date.now() - 24 * 60 * 60 * 1000}})
        .then(token => {
            if (token.deletedCount === 0) {
                console.log("No tokens to delete!");
                return;
            }

            console.log("Whitelist cleared!")
            console.log(token);
        })
        .catch(error => {
            console.log(error.message || "An error occurred while clearing expired whitelist!");
        });
};