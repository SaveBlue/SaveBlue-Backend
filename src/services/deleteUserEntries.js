const mongoose = require('mongoose');
const Income = mongoose.model('Income');
const Expense = mongoose.model('Expense');


// Delete all incomes with provided userID / accountID
exports.deleteIncomes = async (deleteField, ID) => {

    const query = { [deleteField]: ID };

    try {
        await Income.deleteMany(query);
    } catch (error) {
        throw new Error(error || "An error occurred while deleting incomes!");
    }
}

// Delete all expenses with provided userID / accountID
exports.deleteExpenses = async (deleteField, ID) => {

    const query = { [deleteField]: ID };

    try {
        await Expense.deleteMany(query);
    } catch (error) {
        throw new Error(error || "An error occurred while deleting expenses!");
    }
}
