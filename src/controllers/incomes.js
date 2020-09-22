const mongoose = require('mongoose');
const Income = mongoose.model('Income');

exports.findAllIncomesByAccountID = (req, res) => {
    Income.find({accountID : req.params.aid})
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

// Create an income
exports.create = (req, res) => {

    const newIncome = new Income ({
        userID: req.body.userID,
        accountID: req.body.accountID,
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        amount: req.body.amount
    });

    // save income
    newIncome
        .save(newIncome)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while creating new income!"
            });
        });

};

// Delete income with the ID
exports.delete = (req, res) => {
    Income.findByIdAndDelete(req.params.id)
        .then(income => {

            if (!income) {
                res.status(404).send({
                    message: `No income with selected ID!`
                });
            } else {
                res.send({
                    message: "Income deleted!"
                });
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while deleting the income!"
            });
        });
};

// Delete income with the ID
exports.update = (req, res) => {

    let editedIncome = {};

    // Add properties to the object
    if(req.body.name){
        editedIncome["name"] = req.body.name;
    }
    if(req.body.description){
        editedIncome["description"] = req.body.description;
    }
    if(req.body.date){
        editedIncome["date"] = req.body.date;
    }
    if(req.body.amount){
        editedIncome["amount"] = req.body.amount;
    }

    Income.findByIdAndUpdate(req.params.id, { $set: editedIncome }, {new: true})
        .then(income => {
            if (!income) {
                res.status(404).send({
                    message: `No income with selected ID!`
                });
            } else {
                res.status(200).json(income);
            }
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while updating the income!"
            });
        });
};

