import mongoose from 'mongoose';
import file from './file.js';

let Schema = mongoose.Schema;


export const categoriesExpenses = [
    {
        category1: "Personal",
        category2: ["Clothing & Footwear", "Personal Hygiene", "Personal Care Services", "Subscriptions", "Consumer Electronics", "Education"]
    },
    {
        category1: "Food & Drinks",
        category2: ["Groceries", "Restaurants", "Coffee & Tea", "Alcohol"]
    },
    {
        category1: "Home & Utilities",
        category2: ["Bills", "Rent", "Household", "Goods", "Maintenance & Renovation", "Pets"]
    },
    {
        category1: "Transport",
        category2: ["Public transport", "Taxi", "Tolls", "Parking", "Personal vehicle", "Gas"]
    },
    {
        category1: "Leisure",
        category2: ["Gifts", "Sport", "Entertainment", "Culture", "Holidays"]
    },
    {
        category1: "Health",
        category2: ["Medicine & supplements", "Medical services & diagnostics"]
    },
    {
        category1: "Finance",
        category2: ["Insurance", "Taxes", "Debts", "Funds Transfer"]
    }
]


let expense = new Schema({
        accountID: {type: String, required: true},
        userID: {type: String, required: true},
        description: {type: String, maxlength: 32},
        category1: {
            type: String,
            validate: {validator: validateCategory1, message: "Category does not exist."},
            required: true
        },
        category2: {
            type: String,
            validate: {validator: validateCategory2, message: "Category does not exist."},
            required: true
        },
        date: {type: Date, default: Date.now},
        amount: {type: Number, min: 1, max: 100000000, set: round, required: true},
        file: {type: file}
    },
    {
        timestamps: true
    });

// Compound index to optimize account-scoped date queries and sorted pagination
expense.index({ accountID: 1, date: -1, _id: -1 });


// validate category1 with array of allowed categories1
function validateCategory1(category) {
    return !!categoriesExpenses.find(c => (c.category1 === category || category === "Draft"))
}


// validate category2 depending on category1 with array of allowed categories2
function validateCategory2(category2) {
    if (this.category1 === "Draft" && category2 === "Draft"){
        return true
    }
    return !!categoriesExpenses.find(c => (c.category1 === this.category1) && (c.category2.includes(category2)))
}


// Round amount to 0 decimal places
function round(value) {
    return Math.ceil(value);
}


mongoose.model('Expense', expense);
