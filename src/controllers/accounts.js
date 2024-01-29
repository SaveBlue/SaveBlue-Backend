const mongoose = require('mongoose');
const User = mongoose.model('User');
const deleteUserEntries = require('../services/deleteUserEntries');
const draftsAccount = require("../services/draftsAccount");


// Find all accounts of user with requested id
exports.findAllAccountsByUserID = (req, res) => {
    const userId = req.params.uid;
    const archived = !!req.query.archived;

    User.findById(userId, 'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth accounts.archived')
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            // Filter accounts based on the archived status
            const filteredAccounts = user.accounts.filter(account => account.archived === archived);

            res.status(200).json(filteredAccounts);
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

    User.findOne({'accounts._id': req.params.id}, {'accounts.$': 1})
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


// Add a new account to user with requested id
exports.createAccount = (req, res) => {

    // Check account name length
    if (req.body.name && req.body.name.length > 32) {
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
        startOfMonth: req.body.startOfMonth || 1
    };

    // Finds user and appends newAccount to the accounts array, then returns the new account
    User.findByIdAndUpdate(req.params.uid, {$push: {accounts: newAccount}}, {
        new: true,
        select: 'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth'
    })
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }
            // TODO: change when you separate accounts from users
            res.status(200).json(user.accounts.at(-1));

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
    // Step 1: Find the User with the specified Account ID
    User.findOne({'accounts._id': req.params.id})
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // Step 2: Remove the account from the user's accounts array
            user.accounts.pull({_id: req.params.id});

            // Save the updated user document
            user.save()
                .then(async () => {
                    // Delete account's incomes and expenses from db
                    try {
                        await deleteUserEntries.deleteIncomes("accountID", req.params.id);
                        await deleteUserEntries.deleteExpenses("accountID", req.params.id);

                        res.status(200).json(user)
                    } catch (err) {
                        res.status(500).send({ message: err.message || "An error occurred while deleting account entries!" });
                    }
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while deleting the account!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching the account!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Update account with requested id
exports.updateAccountByID = (req, res) => {

    // Check account name length
    if (req.body.name && req.body.name.length > 32) {
        return res.status(413).json({
            message: "Account name too long."
        });
    }

    // Find the user with the requested account
    User.findOne({'accounts._id': req.params.id}, 'accounts._id accounts.name accounts.startOfMonth accounts.totalBalance accounts.availableBalance')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // Get the account from found user
            let account = user.accounts.id(req.params.id);

            // Check if updating account name
            if (req.body.name) {
                account.name = req.body.name;
            }

            // Check if updating startOfMonth and format it correctly
            if (req.body.startOfMonth) {
                account.startOfMonth = req.body.startOfMonth;

                if (account.startOfMonth > 31)
                    account.startOfMonth = 31

                if (account.startOfMonth < 1)
                    account.startOfMonth = 1
            }

            if (typeof req.body.archived === "boolean") {
                account.archived = req.body.archived;
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
//----------------------------------------------------------------------------------------------------------------------


// Find drafts account of user with requested id
exports.findDraftsAccountByUserID = (req, res) => {
    User.findById(req.params.uid)
        .then(async user => {
            if (!user) {
                return res.status(404).json({
                    message: "No user with selected ID!"
                });
            }

            // Create a new drafts account if it does not exist - FOR OLDER ACCOUNTS
            if (!user.draftsAccount) {
                user.draftsAccount = await draftsAccount.create(user._id)
            }
            res.status(200).json(user.draftsAccount);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching user!"
            });
        });
};
