const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const categoriesIncomes = [
    {category1: "Salary & Wage"},
    {category1: "Assets"},
    {category1: "Student Work"},
    {category1: "Funds Transfer"},
    {category1: "Other"},
]


const income = new Schema({
        accountID: {type: String, required: true},
        userID: {type: String, required: true},
        description: {type: String, maxlength: 1024},
        category1: {
            type: String,
            validate: {validator: validateCategory1, message: "Category does not exist."},
            required: true
        },
        date: {type: Date, default: Date.now},
        amount: {type: Number, min: 1, max: 100000000, set: round, required: true}
    },
    {
        timestamps: true
    });


// Validate category1 with array of allowed categories1
function validateCategory1(category) {
    return !!categoriesIncomes.find(c => c.category1 === category)
}


// Round amount to 0 decimal places
function round(value) {
    return Math.ceil(value);
}


mongoose.model('Income', income);


module.exports = categoriesIncomes;
