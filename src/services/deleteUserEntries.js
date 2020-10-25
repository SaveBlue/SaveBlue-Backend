const mongoose = require('mongoose');
const Income = mongoose.model('Income');
const Expense = mongoose.model('Expense');


// Delete all incomes with provided userID / accountID
exports.deleteIncomes = (deleteField, ID) => {

    let pair = {};
    pair[deleteField] = ID;

    return new Promise((resolve, reject) => {

        Income.deleteMany(pair)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error.message || "An error occurred while deleting incomes!");

            })
    })
}

// Delete all expenses with provided userID / accountID
exports.deleteExpenses = (deleteField, ID) => {

    let pair = {};
    pair[deleteField] = ID;

    return new Promise((resolve, reject) => {

        Expense.deleteMany(pair)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error.message || "An error occurred while deleting expenses!");

            })
    })
}
