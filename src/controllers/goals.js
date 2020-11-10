const mongoose = require('mongoose');
const User = mongoose.model('User');
//const deleteUserEntries = require('../services/deleteUserEntries');


// Find an account goal with requested id
exports.findAllGoals = (req, res) => {

    User.findOne({'accounts._id': req.params.aid},'accounts.goals')
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }
            let goals = account.accounts[0].goals;
            res.status(200).json(goals);

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while adding a new account!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Find account with requested id
exports.findGoalByID = (req, res) => {

    User.findOne({'accounts.goals._id': req.params.id},'accounts.goals')
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }
            let goals = account.accounts[0].goals;
            console.log(goals.id === req.params.id)
            // TODO: tukaj sva ostala
            res.status(200).json(goals);

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while adding a new account!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Add a new goal to account with requested id
exports.create = (req, res) => {

    // Check account name length
    if (req.body.name && req.body.name.length > 64 && req.body.description.length > 1024) {
        return res.status(413).json({
            message: "Account name or description too long."
        });
    }

    let newGoal = {
        name: req.body.name || "New Goal",
        description: req.body.description || "",
        currentAmount: 0,
        goalAmount: 0,
        complete: false
    };

    // Finds account and appends newGoal to the goals array, then returns the new list of all goal names
    User.findOne({'accounts._id': req.params.aid},'accounts.goals')
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }
            let goals = account.accounts[0].goals;
            goals.push(newGoal);

            account.save(account)
                .then(() => {
                    res.send({message: "Goal added!"});
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while creating new goal!"
                    });
                });

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while adding a new account!"
            });
        });

};
//----------------------------------------------------------------------------------------------------------------------
