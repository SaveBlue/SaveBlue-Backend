import mongoose from 'mongoose';
import updateAccountBalances from '../services/updateAccountBalances.js';

const Expense = mongoose.model('Expense');
const File = mongoose.model('File');

// Find all expenses of the account with requested id
const findAllExpensesByAccountID = async (req, res) => {
    try {
        const page = req.query.page || 0;
        const expensesPerPage = 16;

        // Fetch expenses with specified conditions
        const expenses = await Expense
            .find({accountID: req.params.aid}, "-file")
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
        const expense = await Expense.findById(req.params.id, "-file.data -file._id");

        if (!expense) {
            return res.status(404).json({
                message: "No expense with selected ID!"
            });
        }

        const expenseData = expense.toObject();
        expenseData.file = expense.file ? expense.file.contentType : false;

        res.status(200).json(expenseData);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the expense!"
        });
    }
};

// Find a file of expense with requested expense id
const findExpenseFileByID = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                message: "No expense with selected ID!"
            });
        }

        const file = expense.file;

        if (!file) {
            return res.status(404).json({
                message: "No file with selected expense ID!"
            });
        }

        res.set('Content-Type', file.contentType);
        res.send(file.data);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the expense!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Create an expense
const create = async (req, res) => {

    const {userID, accountID, category1, category2, description, date, amount, file} = req.body;

    // Check expense description length
    if (description?.length > 32) {
        return res.status(400).json({
            message: "Description too long."
        });
    }

    // Check if amount is a valid integer and within range
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    let newFile = null;
    if (file) {
        newFile = new File({
            contentType: file.contentType,
            data: file.data
        })
    }

    const newExpense = new Expense({
        userID: userID,
        accountID: accountID,
        category1: category1,
        category2: category2,
        description: description,
        date: date,
        amount: amount,
        file: newFile
    });

    try {
        // Save expense
        const savedExpense = await newExpense.save(newExpense);

        // Update account balance
        await updateAccountBalances.updateAllAccountBalances(accountID, amount, "-");

        // Prepare response data (exclude file data)
        const responseData = savedExpense.toObject();
        delete responseData.file; // Remove file from response

        res.json(responseData);

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

    const {accountID, category1, category2, description, date, amount, file} = req.body;

    // Check expense description length
    if (description?.length > 32) {
        return res.status(400).json({
            message: "Description too long."
        });
    }

    // Check if amount is an integer
    if (amount && (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000)) {
        return res.status(400).json({
            message: "Amount not a valid number."
        });
    }

    let editedExpense = {
        // Add properties to the object
        ...(category1 && {category1: category1}),
        ...(category2 && {category2: category2}),
        ...(accountID && {accountID: accountID}),
        ...(description && {description: description}),
        ...(date && {date: date}),
        ...(amount && {amount: amount}),
    };

    if (file) {
        editedExpense.file = new File({
            contentType: file.contentType,
            data: file.data
        })
    } else if (file === false) {
        editedExpense.file = null;
    }

    try {
        // Fetch the old expense and edit it
        const expense = await Expense.findByIdAndUpdate(req.params.id, {$set: editedExpense});

        if (!expense) {
            return res.status(404).send({
                message: `No expense with selected ID!`
            });
        }

        // Get expense amount difference and choose operation
        let oldAmount = expense.amount;
        let newAmount = editedExpense?.amount || oldAmount;
        let difference = Math.abs(oldAmount - newAmount);
        let operation = oldAmount >= newAmount ? "+" : "-";

        // Handle account change
        if (editedExpense.accountID && (expense.accountID !== editedExpense.accountID)) {
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
    findExpenseFileByID,
    create,
    remove,
    update,
    expensesBreakdown
}