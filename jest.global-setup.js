import mongoose from './src/models/db.js'
import mockData from './test_entries.js'; // Assuming this is a module you can import
import {start as start_server} from './src/server.js';
import fs from 'fs';
import path from "path";

export default async () => {

    await start_server();

    const dbURI = 'mongodb://127.0.0.1/SaveBlue_test';
    await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });

    // Clear the database
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }

    await populateTestData();

    fs.writeFileSync( 'test_ids.json', JSON.stringify(testIds, null, 2));
};

let testIds ={
    testUserId: '',
    deleteUserId: '',
    updateUserId: '',
    testAccountId: '',
    deleteAccountId: '',
    updateAccountId: '',
    testExpenseId: '',
    deleteExpenseId: '',
    updateExpenseId: '',
    testIncomeId: '',
    deleteIncomeId: '',
    updateIncomeId: ''
}

async function populateTestData() {
    // add user data to db
    const testUser = await saveUserToDB({
        ...mockData.testUserData,
        accounts: [mockData.testAccountData, mockData.accountDataToDelete, mockData.accountDataToUpdate]
    });
    const userToDelete = await saveUserToDB({...mockData.userToDelete, accounts: [mockData.accountDataToDelete]});
    const userToUpdate = await saveUserToDB({...mockData.userToUpdate, accounts: []});

    testIds.testUserId = testUser._id;
    testIds.deleteUserId = userToDelete._id;
    testIds.updateUserId = userToUpdate._id;

    testIds.testAccountId = testUser.accounts[0]._id;
    testIds.deleteAccountId = testUser.accounts[1]._id;
    testIds.updateAccountId = testUser.accounts[2]._id;

    // add expense data to db
    const testExpense = await saveExpenseToDB({
        ...mockData.testExpenseData,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });
    const expenseToDelete = await saveExpenseToDB({
        ...mockData.expenseDataToDelete,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });
    const expenseToUpdate = await saveExpenseToDB({
        ...mockData.expenseDataToUpdate,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });

    testIds.testExpenseId = testExpense._id;
    testIds.deleteExpenseId = expenseToDelete._id;
    testIds.updateExpenseId = expenseToUpdate._id;

    // add income data to db
    const testIncome = await saveIncomeToDB({
        ...mockData.testIncomeData,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });
    const incomeToDelete = await saveIncomeToDB({
        ...mockData.incomeDataToDelete,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });
    const incomeToUpdate = await saveIncomeToDB({
        ...mockData.incomeDataToUpdate,
        userID: testUser._id,
        accountID: testUser.accounts[0]._id
    });

    testIds.testIncomeId = testIncome._id;
    testIds.deleteIncomeId = incomeToDelete._id;
    testIds.updateIncomeId = incomeToUpdate._id;
}

const saveUserToDB = async (userData) => {
    try {
        const User = mongoose.model('User');

        // Create a new user instance
        let testUser = new User(userData);

        // Hash the password
        testUser.hashPassword(userData.password);

        await testUser.populate({path: 'accounts'}).execPopulate()

        // Save the test user
        await testUser.save();


        return testUser;
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}



const saveIncomeToDB = async (incomeData) => {
    try {
        const Income = mongoose.model('Income');

        // Create a new income instance
        let testIncome = new Income(incomeData);

        // Save the test income
        await testIncome.save();


        return testIncome;
    } catch (error) {
        console.error('Error creating test income:', error);
    }
}

const saveExpenseToDB = async (expenseData) => {
    try {
        const Expense = mongoose.model('Expense');

        // Create a new expense instance
        let testExpense = new Expense(expenseData);

        // Save the test expense
        await testExpense.save();


        return testExpense;
    } catch (error) {
        console.error('Error creating test expense:', error);
    }
}

export const returnTestIds = async () => {
    console.log(testIds)
    return testIds;
}







