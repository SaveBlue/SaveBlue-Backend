const mongoose = require('mongoose');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let config = require('../config/auth');
let Schema = mongoose.Schema;


const budget = new Schema({
    category: {type: String, required: true},
    // category: { type: String, enum: ['category1', 'category2', 'category3'], required: true },
    budgetAmount: {type: Number, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true,}
});


const goal = new Schema({
    name: {type: String, required: true},
    description: String,
    targetAmount: {type: Number, required: true},
    currentAmount: {type: Number, default: 0},
    complete: {type: Boolean, default: false},
});


const account = new Schema({
    name: {type: String, required: true},
    availableBalance: {type: Number, required: true},
    totalBalance: {type: Number, required: true},
    budgets: [budget],
    goals: [goal],
    startOfMonth: {type: Number, required: true}

});


const user = new Schema({
    username: {type: String, required: true, unique:true},
    email: {type: String, required: true, unique:true},
    hashedPassword: {type: String, required: true},
    salt: {type: String, required: true},
    accounts: {type: [account], required: true},
});


// User functions

// Create salt and hash password
user.methods.hashPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hashedPassword = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};


// Hash received password and compare it
user.methods.checkPassword = function(password) {
    let hashedPassword = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hashedPassword === hashedPassword;
};


// Generate and sign jwt for 24 hours
user.methods.generateJWT = function() {

    return jwt.sign({ id: this._id}, config.secret, {
        expiresIn: 86400 // 24 hours
    });
};

mongoose.model('User', user);
