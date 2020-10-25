const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const allowedCategory1 = ["Salary / Wage", "Assets", "Student Work", "Other"]


const income = new Schema({
    accountID: {type: String, required: true},
    userID: {type: String, required: true},
    description: String,
    category1: { type: String, validate: {validator: validateCategory1, message: "Category does not exist."}, required: true },
    date: {type: Date, default: Date.now},
    amount: {type: Number, required: true}
});


// validate category1 with array of allowed categories1
function validateCategory1(category1) {
    return allowedCategory1.includes(category1)
}


mongoose.model('Income', income);
