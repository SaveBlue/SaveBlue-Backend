const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.updateAccountBalances = (accountID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // find the user who has the required account
        User.findOne({'accounts._id': accountID}, 'accounts._id accounts.totalBalance')
            .then(user => {

                if (!user) {
                    reject("No account with selected ID!");
                }

                // get wanted account from found user
                let account = user.accounts.id(accountID);

                // add or subtract from account totalBalance
                switch (operation) {
                    case "+":
                        account.totalBalance += amount;
                        break;

                    case "-":
                        account.totalBalance -= amount;
                        break;
                }

                // save updated user data (updated account)
                user.save()
                    .then(() => {
                        resolve();
                    })
                    .catch(error => {
                        reject(error.message || "An error occurred while updating account!");

                    });
            })
            .catch(error => {
                reject(error.message || "An error occurred while fetching account!");

            })
    })
}
