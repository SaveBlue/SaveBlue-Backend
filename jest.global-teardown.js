const mongoose = require('mongoose');

module.exports = async () => {

    if (global.__SERVER__) {
        await new Promise((resolve, reject) => {
            global.__SERVER__.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    // close mongoose connection
    mongoose.connection.close(function(){
        process.exit(0);
    });
};