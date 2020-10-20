const mongoose = require('mongoose');
const Income = mongoose.model('Income');
const Expense = mongoose.model('Expense');

exports.deleteIncomes = (deleteField, ID) => {

    let pair = {};
    pair[deleteField] = ID;

    return new Promise((resolve, reject) => {

        // delete all incomes with provided userID / accountID
        Income.deleteMany(pair)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error.message || "An error occurred while deleting incomes!");

            })
    })
}

exports.deleteExpenses = (deleteField, ID) => {

    let pair = {};
    pair[deleteField] = ID;

    return new Promise((resolve, reject) => {

        // delete all expenses with provided userID / accountID
        Expense.deleteMany(pair)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error.message || "An error occurred while deleting expenses!");

            })
    })
}
