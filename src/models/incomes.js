const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const income = new Schema({
    accountID: {type: String, required: true},
    userID: {type: String, required: true},
    name: {type: String, required: true},
    description: String,
    // category: { type: String, enum: ['category1', 'category2', 'category3'], required: true },
    date: {type: Date, default: Date.now},
    amount: {type: Number, required: true}
});


mongoose.model('Income', income);
