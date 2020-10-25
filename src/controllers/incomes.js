const mongoose = require('mongoose');
const Income = mongoose.model('Income');
const updateAccountBalances = require('../services/updateAccountBalances');


// Find all incomes of the account with requested id
exports.findAllIncomesByAccountID = (req, res) => {
    Income.find({accountID: req.params.aid}, null, {sort: {date: -1}})
        .then(incomes => {
            if (incomes.length === 0) {
                return res.status(404).json({
                    message: "No incomes with selected account ID!"
                });
            }
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
                await updateAccountBalances.updateTotalBalances(newIncome.accountID, newIncome.amount, "+");
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
                await updateAccountBalances.updateTotalBalances(income.accountID, income.amount, "-");
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


// Delete income with the ID
exports.update = (req, res) => {

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
            if (income.accountID !== editedIncome.accountID){

                // Subtract from old account
                try {
                    await updateAccountBalances.updateTotalBalances(income.accountID, oldAmount, "-");
                } catch (err) {
                    return res.status(500).send({message: err});
                }

                // Add to new account
                try {
                    await updateAccountBalances.updateTotalBalances(editedIncome.accountID, newAmount, "+");
                } catch (err) {
                    return res.status(500).send({message: err});
                }
            }

            // Only update account if there is a difference between amounts
            else if(difference !== 0) {
                try {
                    await updateAccountBalances.updateTotalBalances(income.accountID, difference, operation);
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
