const mongoose = require('mongoose');
const Income = mongoose.model('Income');
const updateAccountBalances = require('../services/updateAccountBalances');


// Find all incomes of the account with requested id
exports.findAllIncomesByAccountID = (req, res) => {
    Income.find({accountID: req.params.aid})
        .sort({date: -1, _id: -1})
        .skip(16 * (req.query.page || 0))
        .limit(16)
        .then(incomes => {
            res.status(200).json(incomes);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching incomes!"
            });
        });
}
//----------------------------------------------------------------------------------------------------------------------


// Find an income with an id
exports.findIncomeByID = (req, res) => {
    Income.findById(req.params.id)
        .then(income => {
            if (!income) {
                return res.status(404).json({
                    message: "No income with selected ID!"
                });
            }
            res.status(200).json(income);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching income!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Create an income
exports.create = (req, res) => {

    // Check income description length
    if (req.body.description && req.body.description.length > 32) {
        return res.status(413).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (!Number.isSafeInteger(req.body.amount) || req.body.amount <= 0 || req.body.amount > 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    const newIncome = new Income({
        userID: req.body.userID,
        accountID: req.body.accountID,
        category1: req.body.category1,
        description: req.body.description,
        date: req.body.date,
        amount: req.body.amount
    });

    // Save income
    newIncome
        .save(newIncome)
        .then(async data => {

            // Update account balance
            try {
                await updateAccountBalances.updateAllAccountBalances(newIncome.accountID, newIncome.amount, "+");
                res.send(data);
            } catch (err) {
                res.status(500).send({message: err});
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while creating new income!"
            });
        });

};
//----------------------------------------------------------------------------------------------------------------------


// Delete income with requested ID
exports.delete = (req, res) => {
    Income.findByIdAndDelete(req.params.id)
        .then(async income => {

            if (!income) {
                return res.status(404).send({message: `No income with selected ID!`});
            }

            // Update account balance
            try {
                await updateAccountBalances.updateAllAccountBalances(income.accountID, income.amount, "-");
                res.send({message: "Income deleted!"});
            }
            catch (err){
                res.status(500).send({ message: err });
            }

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting the income!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// update income with the ID
exports.update = (req, res) => {

    // Check income description length
    if (req.body.description && req.body.description.length > 32) {
        return res.status(413).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (!Number.isSafeInteger(req.body.amount) || req.body.amount <= 0 || req.body.amount > 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    let editedIncome = {};

    // Add properties to the object
    if (req.body.category1) {
        editedIncome["category1"] = req.body.category1;
    }
    if (req.body.description) {
        editedIncome["description"] = req.body.description;
    }
    else{
        editedIncome["description"] = "";
    }
    if (req.body.date) {
        editedIncome["date"] = req.body.date;
    }
    if (req.body.amount) {
        editedIncome["amount"] = req.body.amount;
    }
    if (req.body.accountID) {
        editedIncome["accountID"] = req.body.accountID;
    }

    Income.findByIdAndUpdate(req.params.id, {$set: editedIncome})
        .then(async income => {
            if (!income) {
                return res.status(404).send({
                    message: `No income with selected ID!`
                });
            }

            // Get income amount difference and choose operation
            let oldAmount = income.amount;
            let newAmount = editedIncome.amount;
            let difference = Math.abs(oldAmount - newAmount);
            let operation = oldAmount >= newAmount ? "-" : "+";

            // Handle account change
            if (editedIncome.accountID && (income.accountID !== editedIncome.accountID)){

                // Subtract from old account
                try {
                    await updateAccountBalances.updateAllAccountBalances(income.accountID, oldAmount, "-");
                } catch (err) {
                    return res.status(500).send({message: err});
                }

                // Add to new account
                try {
                    await updateAccountBalances.updateAllAccountBalances(editedIncome.accountID, newAmount, "+");
                } catch (err) {
                    return res.status(500).send({message: err});
                }
            }

            // Only update account if there is a difference between amounts
            else if(difference !== 0) {
                try {
                    await updateAccountBalances.updateAllAccountBalances(income.accountID, difference, operation);
                } catch (err) {
                    return res.status(500).send({message: err});
                }
            }

            res.send({message: "Income updated!"});

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while updating the income!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Return income breakdown by primary categories
exports.incomesBreakdown = (req, res) => {

    if (!req.query.startDate) {
        return res.status(400).json({
            message: "Start date must be present!"
        });
    }

    if (!req.query.endDate) {
        return res.status(400).json({
            message: "End date must be present!"
        });
    }

    let filterObject = {
        accountID: req.params.aid,
        date: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        }
    }

    Income.aggregate()
        .match(filterObject)
        .group({ "_id": "$category1", "sum": { $sum: "$amount"  }})
        .then(breakdown => {
            res.status(200).json(breakdown);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching incomes!"
            });
        });
}
