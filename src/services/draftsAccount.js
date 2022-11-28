const mongoose = require('mongoose');
const User = mongoose.model('User');

// Create drafts account
exports.create = (userID) => {

    return new Promise((resolve, reject) => {

        let draftsAccount = {
            name: "Drafts",
            totalBalance: 0,
            availableBalance: 0,
            budgets: [],
            goals: [],
            expenses: [],
            incomes: [],
            startOfMonth: 1
        };

        // Finds user and appends newAccount to the accounts array, then returns the new account
        User.findByIdAndUpdate(userID, {$set: {draftsAccount: draftsAccount}}, {
            new: true,
            select: 'draftsAccount'
        })
            .then(user => {
                console.log(user)

                if (!user) {
                    reject("No user with selected ID!")
                }
                resolve(user.draftsAccount)

            })
            .catch(error => {
                reject("An error occurred while adding drafts account!")
            });
    })
}