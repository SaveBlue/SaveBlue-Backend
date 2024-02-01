import mongoose from 'mongoose';
import updateAccountBalances from '../services/updateAccountBalances.js';

const Expense = mongoose.model('Expense');

// Find all expenses of the account with requested id
const findAllExpensesByAccountID = async (req, res) => {
    try {
        const page = req.query.page || 0;
        const expensesPerPage = 16;

        // Fetch expenses with specified conditions
        const expenses = await Expense
            .find({accountID: req.params.aid})
            .sort({date: -1, _id: -1})
            .skip(expensesPerPage * page)
            .limit(expensesPerPage);

        res.status(200).json(expenses);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching expenses!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find an expense with requested id
const findExpenseByID = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                message: "No expense with selected ID!"
            });
        }

        res.status(200).json(expense);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the expense!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Create an expense
const create = async (req, res) => {

    // Check expense description length
    if (req.body.description?.length > 32) {
        return res.status(400).json({
            message: "Description too long."
        });
    }

    // Check if amount is a valid integer and within range
    if (!Number.isSafeInteger(req.body.amount) || req.body.amount <= 0 || req.body.amount > 100000000) {
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

    try {
        // Save expense
        const data = await newExpense.save(newExpense);

        // Update account balance
        await updateAccountBalances.updateAllAccountBalances(newExpense.accountID, newExpense.amount, "-");

        res.send(data);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while creating new expense!"
        });
    }

};
//----------------------------------------------------------------------------------------------------------------------


// Delete expense with requested ID
const remove = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).send({message: "No expense with selected ID!"});
        }

        // Update account balance
        await updateAccountBalances.updateAllAccountBalances(expense.accountID, expense.amount, "+");

        res.send({message: "Expense deleted!"});

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while deleting the expense!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Update expense with requested ID
const update = async (req, res) => {

    // Check expense description length
    if (req.body.description?.length > 32) {
        return res.status(400).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (!Number.isSafeInteger(req.body.amount) || req.body.amount <= 0 || req.body.amount > 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    let editedExpense = {
        // Add properties to the object
        ...(req.body.category1 && {category1: req.body.category1}),
        ...(req.body.category2 && {category2: req.body.category2}),
        ...(req.body.accountID && {accountID: req.body.accountID}),
        description: req.body.description || "",
        ...(req.body.date && {date: req.body.date}),
        ...(req.body.amount && {amount: req.body.amount}),
    };


    try {
        // Fetch the old expense and edit it
        const expense = await Expense.findByIdAndUpdate(req.params.id, {$set: editedExpense}, {new: true});

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
        if (editedExpense.accountID && (expense.accountID !== editedExpense.accountID)){
            // Add back to old account
            await updateAccountBalances.updateAllAccountBalances(expense.accountID, oldAmount, "+");

            // Subtract from new account
            await updateAccountBalances.updateAllAccountBalances(editedExpense.accountID, newAmount, "-");
        }

        // Only update account if there is a difference between amounts
        else if (difference !== 0) {
            await updateAccountBalances.updateAllAccountBalances(expense.accountID, difference, operation);
        }

        res.send({message: "Expense updated!"});

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating the expense!"
        });
    }
}
//----------------------------------------------------------------------------------------------------------------------


// Return expense breakdown by primary categories
const expensesBreakdown = async (req, res) => {

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
    };

    try {
        const breakdown = await Expense.aggregate()
            .match(filterObject)
            .group({"_id": "$category1", "sum": {$sum: "$amount"}});

        res.status(200).json(breakdown);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching expenses breakdown!"
        });
    }
};

export default {
    findAllExpensesByAccountID,
    findExpenseByID,
    create,
    remove,
    update,
    expensesBreakdown
}