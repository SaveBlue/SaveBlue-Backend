import mongoose from 'mongoose';

const Income = mongoose.model('Income');
const Expense = mongoose.model('Expense');
const InvestmentPosition = mongoose.model('InvestmentPosition');
const InvestmentEvent = mongoose.model('InvestmentEvent');

// Delete all incomes with provided userID / accountID
const deleteIncomes = async (deleteField, ID) => {

    const query = { [deleteField]: ID };

    try {
        await Income.deleteMany(query);
    } catch (error) {
        throw new Error(error || "An error occurred while deleting incomes!");
    }
}

// Delete all expenses with provided userID / accountID
const deleteExpenses = async (deleteField, ID) => {

    const query = { [deleteField]: ID };

    try {
        await Expense.deleteMany(query);
    } catch (error) {
        throw new Error(error || "An error occurred while deleting expenses!");
    }
}

// Delete all investment positions and events with provided userID / accountID
const deleteInvestments = async (deleteField, ID) => {

    const query = { [deleteField]: ID };

    try {
        await InvestmentPosition.deleteMany(query);
        await InvestmentEvent.deleteMany(query);
    } catch (error) {
        throw new Error(error || "An error occurred while deleting investments!");
    }
}

export default {
    deleteIncomes,
    deleteExpenses,
    deleteInvestments
};