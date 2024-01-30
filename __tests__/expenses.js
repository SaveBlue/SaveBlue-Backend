const request = require('supertest');
const {testUserData, userToDelete, userToUpdate} = require('../test_entries'); // Assuming this contains your test user data

let userToken, deleteUserToken, updateUserToken;

async function loginUserAndGetToken(userData) {

    const response = await request(global.__SERVER__)
        .post('/api/auth/login')
        .send(userData);

    expect(response.statusCode).toBe(200);
    return response.body['x-access-token'];
}


beforeAll(async () => {
    userToken = await loginUserAndGetToken(testUserData);
    deleteUserToken = await loginUserAndGetToken(userToDelete);
    updateUserToken = await loginUserAndGetToken(userToUpdate);
});

describe('GET /api/expenses/find/:aid', () => {

    it('should fail to return data with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/find/${global.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return data with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/find/${global.testAccountId}`)
            .set('x-access-token', updateUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return all expenses of an account', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/find/${global.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

});

describe('GET /api/expenses/:id', () => {

    it('should fail to return expense with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/${global.testExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return expense with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/${global.testExpenseId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return specific expense by ID', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/${global.testExpenseId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('description', 'Test Expense');
    });

});

describe('DELETE /api/expenses/:id', () => {

    it('should fail to delete expense with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/expenses/${global.deleteExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return expense with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/expenses/${global.deleteExpenseId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });


    it('should delete a specific expense by ID', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/expenses/${global.deleteExpenseId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Expense deleted!");
    });
});

describe('PUT /api/expenses/:id', () => {

    it('should fail to update expense with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update expense with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', deleteUserToken)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update expense as draft', async () => {

        const draftUpdateData = {
            category1: "Draft",
            category2: "Draft",
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(draftUpdateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to update expense with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongExpenseDescriptionWeWillNotAcceptItVeryMuchTooLongExpenseDescriptionWeWillNotAcceptIt",
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(413);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to update expense with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update expense with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update expense with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(tooBigIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should update specific expense by ID', async () => {
        const expenseData = {
            amount: 3333,
            description: "Updated",
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Expense updated!');
    });
});

describe('POST /api/expenses/:id', () => {
    it('should fail to create expense with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to create expense with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', updateUserToken)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to create expense as draft', async () => {

        const draftCreateData = {
            category1: "Draft",
            category2: "Draft",
            amount: 10000,
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .put(`/api/expenses/${global.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(draftCreateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to create expense with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongExpenseDescriptionWeWillNotAcceptItVeryMuchTooLongExpenseDescriptionWeWillNotAcceptIt",
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(413);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to create expense with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create expense with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create expense with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(tooBigIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should create expense', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: testUserId,
            accountID: global.testAccountId,
        };

        const response = await request(global.__SERVER__)
            .post('/api/expenses')
            .set('x-access-token', userToken)
            .send(newExpenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('amount', 10000);
        expect(response.body).toHaveProperty('category1', "Food & Drinks");
        expect(response.body).toHaveProperty('category2', "Alcohol");
    });
});

describe('GET /api/expenses/breakdown/:aid', () => {

    it('should fail to return breakdown with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/breakdown/${global.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/breakdown/${global.testAccountId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown without a start date', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/breakdown/${global.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Start date must be present!');
    });

    it('should fail to return breakdown without an end date', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/breakdown/${global.testAccountId}`)
            .set('x-access-token', userToken)
            .query({startDate: '1234'});

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'End date must be present!');
    });

    it('should return expenses breakdown', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/expenses/breakdown/${global.testAccountId}`)
            .set('x-access-token', userToken)
            .query({
                startDate: "2000-12-31",
                endDate: "2222-12-31"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        response.body.forEach(item => {
            expect(item).toHaveProperty('_id');
            expect(typeof item._id).toBe('string');
            expect(item).toHaveProperty('sum');
            expect(typeof item.sum).toBe('number');
        });
    });

});