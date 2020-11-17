const mongoose = require('mongoose');
const User = mongoose.model('User');

// Update both totalAmount and availableAmount
exports.updateAllAccountBalances = (accountID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // Find the user with requested account
        User.findOne({'accounts._id': accountID}, 'accounts._id accounts.totalBalance accounts.availableBalance')
            .then(user => {

                if (!user) {
                    reject("No account with selected ID!");
                }

                // Get requested account from the user
                let account = user.accounts.id(accountID);

                // Add or subtract from account balance
                switch (operation) {
                    case "+":
                        account.totalBalance += amount;
                        account.availableBalance += amount;
                        break;

                    case "-":
                        account.totalBalance -= amount;
                        account.availableBalance -= amount;
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

// Update both availableAmount & goal currentAmount
exports.updateGoalAmount = (goalID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // Find the user with requested account
        User.findOne({'accounts.goals._id': goalID}, 'accounts.goals')
            .then(user => {

                if (!user) {
                    reject("No goal with selected ID!");
                }

                // Get requested account & goal from the user
                let account = user.accounts[0];
                let goal = user.accounts[0].goals.id(goalID);

                // Add or subtract from account balance & goal currentAmount
                switch (operation) {
                    case "+":
                        account.availableBalance -= amount;
                        goal.currentAmount += amount;
                        break;

                    case "-":
                        account.availableBalance += amount;
                        goal.currentAmount -= amount;
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
