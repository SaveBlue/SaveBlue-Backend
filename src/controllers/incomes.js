import mongoose from 'mongoose';
import updateAccountBalances from '../services/updateAccountBalances.js';

const Income = mongoose.model('Income');

// Find all incomes of the account with requested id
const findAllIncomesByAccountID = async (req, res) => {
    try {
        const page = req.query.page || 0;
        const incomePerPage = 16;

        // Fetch income with specified conditions
        const income = await Income
            .find({accountID: req.params.aid})
            .sort({date: -1, _id: -1})
            .skip(incomePerPage * page)
            .limit(incomePerPage);

        res.status(200).json(income);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching incomes!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find an income with an id
const findIncomeByID = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({
                message: "No income with selected ID!"
            });
        }

        res.status(200).json(income);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the income!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Create an income
const create = async (req, res) => {

    // Check income description length
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

    const newIncome = new Income({
        userID: req.body.userID,
        accountID: req.body.accountID,
        category1: req.body.category1,
        description: req.body.description,
        date: req.body.date,
        amount: req.body.amount
    });


    try {
        // Save income
        const data = await newIncome.save(newIncome);

        // Update account balance
        await updateAccountBalances.updateAllAccountBalances(newIncome.accountID, newIncome.amount, "+");

        res.send(data);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while creating new income!"
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------


// Delete income with requested ID
const remove = async (req, res) => {

    try {
        const income = await Income.findByIdAndDelete(req.params.id);

        if (!income) {
            return res.status(404).send({message: "No income with selected ID!"});
        }

        // Update account balance
        await updateAccountBalances.updateAllAccountBalances(income.accountID, income.amount, "-");

        res.send({message: "Income deleted!"});

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while deleting the income!"
        });
    }

};
//----------------------------------------------------------------------------------------------------------------------


// update income with the ID
const update = async (req, res) => {

    // Check income description length
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

    let editedIncome = {
        // Add properties to the object
        ...(req.body.category1 && {category1: req.body.category1}),
        ...(req.body.accountID && {accountID: req.body.accountID}),
        description: req.body.description || "",
        ...(req.body.date && {date: req.body.date}),
        ...(req.body.amount && {amount: req.body.amount}),
    };

    try {
        // Fetch the old income and edit it
        const income = await Income.findByIdAndUpdate(req.params.id, {$set: editedIncome}, {new: true});

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
        if (editedIncome.accountID && (income.accountID !== editedIncome.accountID)){

            // Subtract from old account
            await updateAccountBalances.updateAllAccountBalances(income.accountID, oldAmount, "-");

            // Add to new account
            await updateAccountBalances.updateAllAccountBalances(editedIncome.accountID, newAmount, "+");
        }

        // Only update account if there is a difference between amounts
        else if (difference !== 0) {
            await updateAccountBalances.updateAllAccountBalances(income.accountID, difference, operation);
        }

        res.send({message: "Income updated!"});

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating the income!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Return income breakdown by primary categories
const incomesBreakdown = async (req, res) => {

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
        const breakdown = await Income.aggregate()
            .match(filterObject)
            .group({"_id": "$category1", "sum": {$sum: "$amount"}});

        res.status(200).json(breakdown);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching incomes breakdown!"
        });
    }
}

export default {
    findAllIncomesByAccountID,
    findIncomeByID,
    create,
    remove,
    update,
    incomesBreakdown
}