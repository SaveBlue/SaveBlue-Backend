const mongoose = require('mongoose');
const User = mongoose.model('User');
const deleteUserEntries = require('../services/deleteUserEntries');
const draftsAccount = require("../services/draftsAccount");


// Find all accounts of user with requested id
exports.findAllAccountsByUserID = async (req, res) => {
    try {
        const userId = req.params.uid;
        const archived = !!req.query.archived;

        const user = await User.findById(userId, 'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth accounts.archived');

        if (!user) {
            return res.status(404).json({
                message: "No user with selected ID!"
            });
        }

        // Filter accounts based on the archived status
        const filteredAccounts = user.accounts.filter(account => account.archived === archived);

        res.status(200).json(filteredAccounts);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching user!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Find account with requested id
exports.findAccountByID = async (req, res) => {
    try {
        const account = await User.findOne({'accounts._id': req.params.id}, {'accounts.$': 1});

        if (!account) {
            return res.status(404).json({
                message: "No account with selected ID!"
            });
        }

        res.status(200).json(account.accounts[0]);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching account!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Add a new account to user with requested id
exports.createAccount = async (req, res) => {

    // Check account name length
    if (req.body.name?.length > 128) {
        return res.status(400).json({
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
        startOfMonth: req.body.startOfMonth
    };

    try {
        // Finds user and appends newAccount to the accounts array, then returns the new account
        const user = await User.findByIdAndUpdate(req.params.uid, {$push: {accounts: newAccount}}, {
            new: true,
            select: 'accounts._id accounts.name accounts.totalBalance accounts.availableBalance accounts.startOfMonth'
        });

        if (!user) {
            return res.status(404).json({
                message: "No user with selected ID!"
            });
        }

        // TODO: change when you separate accounts from users
        res.status(200).json(user.accounts.at(-1));

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while adding a new account!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Delete account with requested id
exports.deleteAccountByID = async (req, res) => {
    try {
        // Find the user with the requested account
        const user = await User.findOne({'accounts._id': req.params.id}, 'accounts._id accounts.name');

        if (!user) {
            return res.status(404).json({
                message: "No account with selected ID!"
            });
        }

        // Remove the selected account
        user.accounts.pull({'_id': req.params.id});

        // Save updated user data (deleted account)
        await user.save();

        // Delete account's incomes from db
        await deleteUserEntries.deleteIncomes("accountID", req.params.id);

        // Delete account's expenses from db
        await deleteUserEntries.deleteExpenses("accountID", req.params.id);

        res.status(200).json(user);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while deleting the Account!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Update account with requested id
exports.updateAccountByID = async (req, res) => {

    // Check account name length
    if (req.body.name?.length > 128) {
        return res.status(400).json({
            message: "Account name too long."
        });
    }

    try {
        // Find the user with the requested account
        const user = await User.findOne({'accounts._id': req.params.id}, 'accounts._id accounts.name accounts.startOfMonth accounts.totalBalance accounts.availableBalance');

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

        // Ensure startOfMonth is within 1 to 31 range
        if (req.body.startOfMonth) {
            account.startOfMonth = Math.max(1, Math.min(req.body.startOfMonth, 31));
        }

        if (typeof req.body.archived === "boolean") {
            account.archived = req.body.archived;
        }

        // Save updated user data (updated account)
        await user.save();

        res.status(200).json(account);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating the Account!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Find drafts account of user with requested id
exports.findDraftsAccountByUserID = async (req, res) => {
    try {
        const user = await User.findById(req.params.uid);

        if (!user) {
            return res.status(404).json({
                message: "No user with selected ID!"
            });
        }

        // Create a new drafts account if it does not exist - FOR OLDER ACCOUNTS
        if (!user.draftsAccount) {
            user.draftsAccount = await draftsAccount.create(user._id);
        }

        res.status(200).json(user.draftsAccount);
    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching draft Account!"
        });
    }
};

