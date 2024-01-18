import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/auth';

let Schema = mongoose.Schema;

const budget = new Schema({
        category: {type: String, required: true},
        // category: { type: String, enum: ['category1', 'category2', 'category3'], required: true },
        budgetAmount: {type: Number, set: round, required: true},
        startDate: {type: Date, required: true},
        endDate: {type: Date, required: true,}
    },
    {
        timestamps: true
    });


const goal = new Schema({
        name: {type: String, maxlength: 32, required: true},
        description: {type: String, maxlength: 1024},
        goalAmount: {type: Number, set: round, required: true},
        currentAmount: {type: Number, set: round, default: 0},
        complete: {type: Boolean, default: false},
        goalDate: {type: Date, default: new Date(0)}
    },
    {
        timestamps: true
    });


const account = new Schema({
        name: {type: String, maxlength: 32, required: true},
        availableBalance: {type: Number, set: round, required: true},
        totalBalance: {type: Number, set: round, required: true},
        budgets: [budget],
        goals: [goal],
        startOfMonth: {type: Number, min: 1, max: 31, set:round, required: true},
        archived: {type: Boolean, default: false}

    },
    {
        timestamps: true
    });


const user = new Schema({
        username: {type: String, maxlength: 32, required: true, unique: true},
        email: {type: String, maxlength: 128, required: true, unique: true},
        hashedPassword: {type: String, required: true},
        salt: {type: String, required: true},
        accounts: {type: [account], required: true},
        draftsAccount: {type: account},
    },
    {
        timestamps: true
    });

// User functions

// Create salt and hash password
user.methods.hashPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hashedPassword = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};


// Hash received password and compare it
user.methods.checkPassword = function (password) {
    let hashedPassword = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hashedPassword === hashedPassword;
};


// Generate and sign jwt for 24 hours
user.methods.generateJWT = function () {

    return jwt.sign({id: this._id}, config.secret, {
        expiresIn: 86400 // 24 hours
    });
};


// Round amount to 0 decimal places
function round(value) {
    return Math.ceil(value);
}


mongoose.model('User', user);
