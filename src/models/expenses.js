const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const allowedCategory1 = ["Personal", "Food & Drinks", "Home & Utilities", "Transport", "Leisure", "Health"]
const allowedCategory21 = ["Clothing & Footwear", "Personal Hygiene", "Personal Care Services", "Subscriptions", "Consumer Electronics", "Education", "Insurance", "Taxes", "Debts", "Funds Transfer"]
const allowedCategory22 = ["Groceries", "Restaurants", "Coffee & Tea", "Alcohol"]
const allowedCategory23 = ["Bills", "Rent", "Household", "Goods", "Maintenance"]
const allowedCategory24 = ["Public transport", "Taxi", "Tolls", "Parking", "Personal vehicle", "Gas"]
const allowedCategory25 = ["Sport", "Entertainment", "Culture", "Holidays"]
const allowedCategory26 = ["Medicine & supplements", "Medical services & diagnostics"]


let expense = new Schema({
    accountID: {type: String, required: true},
    userID: {type: String, required: true},
    description: {type: String, maxlength: 1024},
    category1: { type: String, validate: {validator: validateCategory1, message: "Category does not exist."}, required: true },
    category2: { type: String, validate: {validator: validateCategory2, message: "Category does not exist."}, required: true },
    date: {type: Date, default: Date.now},
    amount: {type: Number, min : 0.01, max : 1000000, set: round, required: true}
});


// validate category1 with array of allowed categories1
function validateCategory1(category1) {
    return allowedCategory1.includes(category1)
}


// validate category2 depending on category1 with array of allowed categories2x
function validateCategory2(category2){

    switch (this.category1){
        case "Personal":
            return allowedCategory21.includes(category2)
        case "Food & Drinks":
            return allowedCategory22.includes(category2)
        case "Home & Utilities":
            return allowedCategory23.includes(category2)
        case "Transport":
            return allowedCategory24.includes(category2)
        case "Leisure":
            return allowedCategory25.includes(category2)
        case "Health":
            return allowedCategory26.includes(category2)

    }
}


// Round amount to 2 decimal places
function round(value) {
    return value.toFixed(2);
}


mongoose.model('Expense', expense);
