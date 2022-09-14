const mongoose = require('mongoose');
const Expense = mongoose.model('Expense');
const updateAccountBalances = require('../services/updateAccountBalances');


// Find all expenses of the account with requested id
exports.findAllExpensesByAccountID = (req, res) => {
    Expense.find({accountID: req.params.aid}, null, {sort: {date: -1}})
        .then(expenses => {
            res.status(200).json(expenses);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching expenses!"
            });
        });
}
//----------------------------------------------------------------------------------------------------------------------


// Find an expense with requested id
exports.findExpenseByID = (req, res) => {
    Expense.findById(req.params.id)
        .then(expense => {
            if (!expense) {
                return res.status(404).json({
                    message: "No expense with selected ID!"
                });
            }
            res.status(200).json(expense);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching the expense!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Create an expense
exports.create = (req, res) => {

    // Check expense description length
    if (req.body.description && req.body.description.length > 1024) {
        return res.status(413).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (!Number.isSafeInteger(req.body.amount) || req.body.amount <= 0 || !req.body.amount > 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    const newExpense = new Expense({
        userID: req.body.userID,
        accountID: req.body.accountID,
        category1: req.body.category1,
        category2: req.body.category2,
        description: req.body.description,
        date: req.body.date,
        amount: req.body.amount
    });

    // Save expense
    newExpense
        .save(newExpense)
        .then(async data => {

            // Update account balance
            try {
                await updateAccountBalances.updateAllAccountBalances(newExpense.accountID, newExpense.amount, "-");
                res.send(data);
            } catch (err) {
                res.status(500).send({message: err});
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while creating new expense!"
            });
        });

};
//----------------------------------------------------------------------------------------------------------------------


// Delete expense with requested ID
exports.delete = (req, res) => {
    Expense.findByIdAndDelete(req.params.id)
        .then(async expense => {

            if (!expense) {
                return res.status(404).send({message: "No expense with selected ID!"});
            }

            // Update account balance
            try {
                await updateAccountBalances.updateAllAccountBalances(expense.accountID, expense.amount, "+");
                res.send({message: "Expense deleted!"});
            }
            catch (err){
                res.status(500).send({ message: err });
            }

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting the expense!"
            });
        });
};
//----------------------------------------------------------------------------------------------------------------------


// Update expense with requested ID
exports.update = (req, res) => {

    // Check expense description length
    if (req.body.description && req.body.description.length > 1024) {
        return res.status(413).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (!Number.isSafeInteger(req.body.amount) && req.body.amount > 0 && req.body.amount <= 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    let editedExpense = {};

    // Add properties to the object
    if (req.body.category1) {
        editedExpense["category1"] = req.body.category1;
    }
    if (req.body.category2) {
        editedExpense["category2"] = req.body.category2;
    }
    if (req.body.accountID) {
        editedExpense["accountID"] = req.body.accountID;
    }
    if (req.body.description) {
        editedExpense["description"] = req.body.description;
    }
    else{
        editedExpense["description"] = "";
    }
    if (req.body.date) {
        editedExpense["date"] = req.body.date;
    }
    if (req.body.amount) {
        editedExpense["amount"] = req.body.amount;
    }

    // Fetch the old expense and edit it
    Expense.findByIdAndUpdate(req.params.id, {$set: editedExpense})
        .then(async expense => {
            if (!expense) {
                return res.status(404).send({
                    message: `No expense with selected ID!`
                });
            }

            // Get expense amount difference and choose operation
            let oldAmount = expense.amount;
            let newAmount = editedExpense.amount;
            let difference = Math.abs(oldAmount - newAmount);
            let operation = oldAmount >= newAmount ? "+" : "-";

            // Handle account change
            if (expense.accountID !== editedExpense.accountID){

                // Add back to old account
                try {
                    await updateAccountBalances.updateAllAccountBalances(expense.accountID, oldAmount, "+");
                } catch (err) {
                    return res.status(500).send({message: err});
                }

                // Subtract from new account
                try {
                    await updateAccountBalances.updateAllAccountBalances(editedExpense.accountID, newAmount, "-");
                } catch (err) {
                    return res.status(500).send({message: err});
                }
            }

            // Only update account if there is a difference between amounts
            else if(difference !== 0) {
                try {
                    await updateAccountBalances.updateAllAccountBalances(expense.accountID, difference, operation);
                } catch (err) {
                    return res.status(500).send({message: err});
                }
            }

            res.send({message: "Expense updated!"});
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while updating the expense!"
            });
        });
};

//----------------------------------------------------------------------------------------------------------------------

// Return grouped expense categories
exports.expensesBreakdown = (req, res) => {
    Expense.aggregate()
        .match({accountID: req.params.aid})
        .group({ "_id": "$category1", "sum": { $sum: "$amount"  }})
        .then(breakdown => {

            console.log(breakdown)
            res.status(200).json(breakdown);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching expenses!"
            });
        });
}
//{accountID: req.params.aid}, 'amount category1', {sort: {date: -1}}