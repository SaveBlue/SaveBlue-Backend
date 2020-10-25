const mongoose = require('mongoose');
const User = mongoose.model('User');

// Update account totalBalance
exports.updateTotalBalances = (accountID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // Find the user with requested account
        User.findOne({'accounts._id': accountID}, 'accounts._id accounts.totalBalance')
            .then(user => {

                if (!user) {
                    reject("No account with selected ID!");
                }

                // Get requested account from the user
                let account = user.accounts.id(accountID);

                // Add or subtract from account totalBalance
                switch (operation) {
                    case "+":
                        account.totalBalance += amount;
                        break;

                    case "-":
                        account.totalBalance -= amount;
                        break;
                }

                // Save updated user data (updated account)
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
