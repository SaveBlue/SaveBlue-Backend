const mongoose = require('mongoose');
const User = mongoose.model('User');

// Find all accounts of user with selected id
exports.findAllAccountsByUserID = (req, res) => {
    User.findById( req.params.uid, 'accounts._id accounts.name accounts.currentBalance accounts.startOfMonth')
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
//-----------------------------------------------------------------------------------

// Find account with selected id
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
        })
};
//-----------------------------------------------------------------------------------



// Add a new account to an user with selected id
exports.createAccount = (req, res) => {

    let newAccount = {
        name: req.body.name || "New Account",
        currentBalance: 0,
        budgets: [],
        goals: [],
        expenses: [],
        incomes: [],
        startOfMonth: 1
    };

    //finds user and appends newAccount to the accounts array, then returns the new list of all account names
    User.findByIdAndUpdate(req.params.uid,{$push: {accounts: newAccount}},{new:true, select:'accounts._id accounts.name accounts.currentBalance accounts.startOfMonth'} )
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
//-----------------------------------------------------------------------------------


// Delete account with selected id
exports.deleteAccountByID = (req, res) => {

    // find the user who has the required account
    User.findOne({'accounts._id': req.params.id},'accounts._id accounts.name')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // remove the selected account
            user.accounts.pull({'_id': req.params.id})

            // save updated user data (deleted account)
            user.save()
                .then(() => {
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
//-----------------------------------------------------------------------------------


// Update account with selected id
exports.updateAccountByID = (req, res) => {

    // find the user who has the required account
    User.findOne({'accounts._id': req.params.id}, 'accounts._id accounts.name accounts.startOfMonth')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // get wanted account from found user
            let account = user.accounts.id(req.params.id);

            // check if updating name
            if(req.body.name) {
                account.name = req.body.name;
            }

            // check if updating startOfMonth and format it correctly
            if(req.body.startOfMonth) {
                account.startOfMonth = req.body.startOfMonth;

                if(account.startOfMonth > 31)
                    account.startOfMonth = 31

                if(account.startOfMonth < 1)
                    account.startOfMonth = 1
            }

            console.log(account)

            // save updated user data (updated account)
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






