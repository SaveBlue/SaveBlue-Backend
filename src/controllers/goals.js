const mongoose = require('mongoose');
const User = mongoose.model('User');
const updateAccountBalances = require('../services/updateAccountBalances');

// Find all goals of account with requested id
exports.findAllGoals = (req, res) => {

    User.findOne({'accounts._id': req.params.aid}, 'accounts.goals')
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
                message: error.message || "An error occurred while retrieving goals!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Find goal with requested id
exports.findGoalByID = (req, res) => {

    User.findOne({'accounts.goals._id': req.params.id}, 'accounts.goals')
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No goal with selected ID!"
                });
            }

            res.status(200).json(account.accounts[0].goals[0]);

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while retrieving goal!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// delete goal with requested id
exports.delete = (req, res) => {

    User.findOne({'accounts.goals._id': req.params.id}, 'accounts.goals')
        .then(account => {

            if (!account) {
                return res.status(404).json({
                    message: "No goal with selected ID!"
                });
            }
            let goalCurrentAmount = account.accounts[0].goals.id(req.params.id).currentAmount;
            account.accounts[0].goals.pull({'_id': req.params.id});


            account.save()
                .then(async () => {
                    // Delete goal's currentAmount from account
                    try {
                        await updateAccountBalances.updateGoalAmount(req.params.id, goalCurrentAmount, "-");
                    } catch (err) {
                        return res.status(500).send({message: err});
                    }

                    res.send({message: "Goal deleted!"});
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while deleting goal!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting goal!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Update goal by ID
exports.update = (req, res) => {

    // Check goal name & description length
    if (req.body.name && req.body.name.length > 64 && req.body.description && req.body.description.length > 1024) {
        return res.status(413).json({
            message: "Goal name or description too long."
        });
    }

    // Find the user with the requested account
    User.findOne({'accounts.goals._id': req.params.id}, 'accounts.goals')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No goal with selected ID!"
                });
            }

            // Get the goal from found user
            let goal = user.accounts[0].goals.id(req.params.id);


            // Check if updating goal name
            if (req.body.name) {
                goal.name = req.body.name;
            }

            // Check if updating goal description
            if (req.body.description) {
                goal.description = req.body.description;
            }

            // Check if updating goal amount
            if (req.body.goalAmount) {
                goal.goalAmount = req.body.goalAmount
            }

            // Save updated user data (updated goal)
            user.save()
                .then(() => {
                    res.status(200).json(goal)
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while updating goal!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching goal!"
            });
        })
};
//----------------------------------------------------------------------------------------------------------------------


// Update goal amount
exports.updateGoalCurrentAmount = (req, res) => {

    // Find the user with the requested account
    User.findOne({'accounts.goals._id': req.params.id}, 'accounts.goals')
        .then(user => {

            if (!user) {
                return res.status(404).json({
                    message: "No goal with selected ID!"
                });
            }

            // Get the goal from found user
            let goal = user.accounts[0].goals.id(req.params.id);


            // Check if updating goal currentAmount
            if (!req.body.currentAmount) {
                return res.status(422).json({
                    message: "No goal currentAmount provided!"
                });
            }

            if (!req.body.operation) {
                return res.status(422).json({
                    message: "No goal operation provided!"
                });
            }

            // operation selection
            switch (req.body.operation) {
                case "+":
                    goal.currentAmount += req.body.currentAmount;
                    break;

                case "-":
                    // subtraction capping
                    if (goal.currentAmount < req.body.currentAmount) {
                        return res.status(400).json({
                            message: "Can't subtract to negative!"
                        });
                    }
                    goal.currentAmount -= req.body.currentAmount;
                    break;
            }

            goal.currentAmount += req.body.currentAmount;

            // Save updated user data (updated goal)
            user.save()
                .then(async () => {

                    // update available amount in account
                    try {
                        // operation selection
                        switch (req.body.operation) {
                            case "+":
                                await updateAccountBalances.updateGoalAmount(req.params.id, req.body.currentAmount, "+");
                                break;

                            case "-":
                                await updateAccountBalances.updateGoalAmount(req.params.id, req.body.currentAmount, "-");
                                break;
                        }
                    } catch (err) {
                        return res.status(500).send({message: err});
                    }

                    res.status(200).json(goal)
                })
                .catch(error => {
                    res.status(500).send({
                        message: error.message || "An error occurred while updating goal!"
                    });
                });
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching goal!"
            });
        })
};
//----------------------------------------------------------------------------------------------------------------------


// Add a new goal to account with requested id
exports.create = (req, res) => {

    // Check goal name & description length
    if (req.body.name && req.body.name.length > 64 && req.body.description && req.body.description.length > 1024) {
        return res.status(413).json({
            message: "Goal name or description too long."
        });
    }

    let newGoal = {
        name: req.body.name || "New Goal",
        description: req.body.description || "",
        currentAmount: 0,
        goalAmount: req.body.goalAmount || 0,
        complete: false
    };

    // Finds account and appends newGoal to the goals array, then returns the new list of all goal names
    User.findOne({'accounts._id': req.params.aid}, 'accounts.goals')
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
                message: error.message || "An error occurred while creating a new goal!"
            });
        });

};
//----------------------------------------------------------------------------------------------------------------------
