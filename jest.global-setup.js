const {start} = require('./src/server'); // Your Express app
const mongoose = require('./src/models/db');

module.exports = async () => {
    global.__SERVER__ = await start();

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
    await getJWTtoLogut();
};

const mockData = require('./test_entries')
const request = require('supertest');

async function populateTestData() {
    // add user data to db
    const testUser = await saveUserToDB({...mockData.testUserData, accounts: [mockData.testAccountData, mockData.accountDataToDelete, mockData.accountDataToUpdate]});
    const userToDelete = await saveUserToDB({...mockData.userToDelete, accounts: [mockData.accountDataToDelete]});
    const userToUpdate = await saveUserToDB({...mockData.userToUpdate, accounts: []});

    global.testUserId = testUser._id;
    global.deleteUserId = userToDelete._id;
    global.updateUserId = userToUpdate._id;

    global.testAccountId = testUser.accounts[0]._id;
    global.deleteAccountId = testUser.accounts[1]._id;
    global.updateAccountId = testUser.accounts[2]._id;

    // add expense data to db

    // add income data to db
    const testIncome = await saveIncomeToDB({...mockData.testIncomeData, userID: testUser._id, accountID: testUser.accounts[0]._id});
    const incomeToDelete = await saveIncomeToDB({...mockData.incomeDataToDelete, userID: testUser._id, accountID: testUser.accounts[0]._id});
    const incomeToUpdate = await saveIncomeToDB({...mockData.incomeDataToUpdate, userID: testUser._id, accountID: testUser.accounts[0]._id});

    global.testIncomeId = testIncome._id;
    global.deleteIncomeId = incomeToDelete._id;
    global.updateIncomeId = incomeToUpdate._id;
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

const getJWTtoLogut = async () => {
    const response = await request(global.__SERVER__)
        .post('/api/auth/login')
        .send({
            username: mockData.testUserData.username,
            password: mockData.testUserData.password
        })

    global.JWTtoLogout = response.body['x-access-token']
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





