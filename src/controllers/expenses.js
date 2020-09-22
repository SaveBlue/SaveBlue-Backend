const mongoose = require('mongoose');
const Expense = mongoose.model('Expense');

exports.findAllExpensesByAccountID = (req, res) => {
    Expense.find({accountID : req.params.aid})
        .then(expenses => {
            if (expenses.length === 0) {
                return res.status(404).json({
                    message: "No expenses with selected account ID!"
                });
            }
            res.status(200).json(expenses);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching expenses!"
            });
        });
}

// Find an expense with an id
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

// Create an expense
exports.create = (req, res) => {

    const newExpense = new Expense ({
        userID: req.body.userID,
        accountID: req.body.accountID,
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        amount: req.body.amount
    });

    // save expense
    newExpense
        .save(newExpense)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while creating new expense!"
            });
        });

};

// Delete expense with the ID
exports.delete = (req, res) => {
    Expense.findByIdAndDelete(req.params.id)
        .then(expense => {

            if (!expense) {
                res.status(404).send({
                    message: `No expense with selected ID!`
                });
            } else {
                res.send({
                    message: "Expense deleted!"
                });
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting the expense!"
            });
        });
};

// Delete expense with the ID
exports.update = (req, res) => {

    let editedExpense = {};

    // Add properties to the object
    if(req.body.name){
        editedExpense["name"] = req.body.name;
    }
    if(req.body.description){
        editedExpense["description"] = req.body.description;
    }
    if(req.body.date){
        editedExpense["date"] = req.body.date;
    }
    if(req.body.amount){
        editedExpense["amount"] = req.body.amount;
    }

    Expense.findByIdAndUpdate(req.params.id, { $set: editedExpense }, {new: true})
        .then(expense => {
            if (!expense) {
                res.status(404).send({
                    message: `No expense with selected ID!`
                });
            } else {
                res.status(200).json(expense);
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while updating the expense!"
            });
        });
};

