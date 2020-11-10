const mongoose = require('mongoose');
const User = mongoose.model('User');
const deleteUserEntries = require('../services/deleteUserEntries');


// Find all accounts of user with requested id
exports.findAllAccountsByUserID = (req, res) => {
    User.findById( req.params.uid, 'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth')
        .then(accounts => {
            if (!accounts) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            res.status(200).json(accounts.accounts);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching user!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Find account with requested id
exports.findAccountByID = (req, res) => {

    User.findOne({'accounts._id': req.params.id},{'accounts.$': 1} )
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }
            res.status(200).json(account.accounts[0]);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching account!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Add a new account to an user with requested id
exports.createAccount = (req, res) => {

    // Check account name length
    if (req.body.name && req.body.name.length > 128) {
        return res.status(413).json({
            message: "Account name too long."
        });
    }

    let newAccount = {
        name: req.body.name || "New Account",
        totalBalance: 0,
        availableBalance: 0,
        budgets: [],
        goals: [],
        expenses: [],
        incomes: [],
        startOfMonth: 1
    };

    // Finds user and appends newAccount to the accounts array, then returns the new list of all account names
    User.findByIdAndUpdate(req.params.uid,{$push: {accounts: newAccount}},{new:true, select:'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth'} )
        .then(accounts => {

            if (!accounts) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            res.status(200).json(accounts.accounts);

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while adding a new account!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Delete account with requested id
exports.deleteAccountByID = (req, res) => {

    // Find the user with the requested account
    User.findOne({'accounts._id': req.params.id},'accounts._id accounts.name')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // Remove the selected account
            user.accounts.pull({'_id': req.params.id})

            // Save updated user data (deleted account)
            user.save()
                .then(async () => {

                    // Delete account's incomes from db
                    try {
                        await deleteUserEntries.deleteIncomes("accountID", req.params.id);
                    }catch (err){
                        return res.status(500).send({message: err});
                    }

                    // Delete account's expenses from db
                    try {
                        await deleteUserEntries.deleteExpenses("accountID", req.params.id);
                    }catch (err){
                        return res.status(500).send({message: err});
                    }

                    res.status(200).json(user)
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while deleting account!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching account!"
            });
        })
};
//----------------------------------------------------------------------------------------------------------------------


// Update account with requested id
exports.updateAccountByID = (req, res) => {


    // Check account name length
    if (req.body.name && req.body.name.length > 128) {
        return res.status(413).json({
            message: "Account name too long."
        });
    }

    // Find the user with the requested account
    User.findOne({'accounts._id': req.params.id}, 'accounts._id accounts.name accounts.startOfMonth')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // Get the account from found user
            let account = user.accounts.id(req.params.id);

            // Check if updating account name
            if(req.body.name) {
                account.name = req.body.name;
            }

            // Check if updating startOfMonth and format it correctly
            if(req.body.startOfMonth) {
                account.startOfMonth = req.body.startOfMonth;

                if(account.startOfMonth > 31)
                    account.startOfMonth = 31

                if(account.startOfMonth < 1)
                    account.startOfMonth = 1
            }

            // Save updated user data (updated account)
            user.save()
                .then(() => {
                    res.status(200).json(account)
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while updating account!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching account!"
            });
        })
};
