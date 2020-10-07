const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.updateAccountBalances = (accountID, amount, operation) =>{

    return new Promise((resolve, reject) => {

        // find the user who has the required account
        User.findOne({'accounts._id': accountID}, 'accounts._id accounts.currentBalance')
            .then(user => {

                if (!user) {
                    // TODO: return error
                    reject("No account with selected ID!");
                    /*return res.status(404).json({
                        message: "No account with selected ID!"
                    });*/
                }

                // get wanted account from found user
                let account = user.accounts.id(accountID);

                // add or subtract from account currentBalance
                switch (operation){

                    case "+":
                        account.currentBalance += amount;
                        break;

                    case "-":
                        account.currentBalance -= amount;
                        break;
                }

                // save updated user data (updated account)
                user.save()
                    .then(() => {
                        resolve();
                        //res.status(200).json(account)
                    })
                    .catch(error => {
                        reject();
                        /*res.status(500).send({
                            message: error.message || "An error occurred while updating account!"
                        });*/
                    });
            })
            .catch(error => {
                reject(error.message || "An error occurred while fetching account!");
                /*res.status(500).send({
                    message: error.message || "An error occurred while fetching account!"
                });*/
            })
    })
}
