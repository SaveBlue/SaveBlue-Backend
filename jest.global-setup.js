const { start } = require('./src/server'); // Your Express app
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
    const testUser = await saveUserToDB({...mockData.testUserData, accounts: [mockData.testAccountData, mockData.accountDataToDelete]});
    const userToDelete = await saveUserToDB({...mockData.userToDelete, accounts: [mockData.accountDataToDelete]});
    global.deleteUserId = userToDelete._id;
    global.deleteAccountId = testUser.accounts[1]._id;

    // add expense data to db

    // add income data to db
}

const saveUserToDB = async (userData) => {
    try {
        const User = mongoose.model('User');

        // Create a new user instance
        let testUser = new User(userData);

        // Hash the password
        testUser.hashPassword(userData.password);

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





