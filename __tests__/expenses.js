import supertest from 'supertest';
import {
    testUserData,
    userToDelete,
    userToUpdate,
    pngString,
    pngStringTooLarge,
    testExpenseData,
} from '../test_entries.js'
import {server} from '../src/server.js'
import idData from '../test_ids.json';

const api = supertest(server);

let userToken, deleteUserToken, updateUserToken;
let pngTooLargeString;

async function loginUserAndGetToken(userData) {

    const response = await api
        .post('/api/auth/login')
        .send(userData);

    expect(response.statusCode).toBe(200);
    return response.body['x-access-token'];
}


beforeAll(async () => {
    userToken = await loginUserAndGetToken(testUserData);
    deleteUserToken = await loginUserAndGetToken(userToDelete);
    updateUserToken = await loginUserAndGetToken(userToUpdate);

    pngTooLargeString = pngStringTooLarge();
});

describe('GET /api/expenses/find/:aid', () => {

    it('should fail to return data with non-whitelist token', async () => {
        const response = await api
            .get(`/api/expenses/find/${idData.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return data with wrong token', async () => {
        const response = await api
            .get(`/api/expenses/find/${idData.testAccountId}`)
            .set('x-access-token', updateUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return all expenses of an account', async () => {
        const response = await api
            .get(`/api/expenses/find/${idData.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

});

describe('GET /api/expenses/:id', () => {

    it('should fail to return expense with non-whitelist token', async () => {
        const response = await api
            .get(`/api/expenses/${idData.testExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return expense with wrong token', async () => {
        const response = await api
            .get(`/api/expenses/${idData.testExpenseId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return specific expense by ID without file', async () => {
        const response = await api
            .get(`/api/expenses/${idData.testExpenseId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('file', false);
        expect(response.body).toHaveProperty('description', 'Test Expense');
    });

    it('should return specific expense by ID with file', async () => {
        const response = await api
            .get(`/api/expenses/${idData.fileTestExpense1Id}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('file', 'image/png');
        expect(response.body).toHaveProperty('description', 'Test Expense');
    });

});

describe('GET /api/expenses/file/:id', () => {

    it('should fail to return expense with non-whitelist token', async () => {
        const response = await api
            .get(`/api/expenses/file/${idData.testExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return expense with wrong token', async () => {
        const response = await api
            .get(`/api/expenses/file/${idData.testExpenseId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should not return file for specific expense without file by ID ', async () => {
        const response = await api
            .get(`/api/expenses/file/${idData.testExpenseId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(404);
    });

    it('should return file for specific expense by ID', async () => {
        const response = await api
            .get(`/api/expenses/file/${idData.fileTestExpense1Id}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
    });

});

describe('DELETE /api/expenses/:id', () => {

    it('should fail to delete expense with non-whitelist token', async () => {
        const response = await api
            .delete(`/api/expenses/${idData.deleteExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return expense with wrong token', async () => {
        const response = await api
            .delete(`/api/expenses/${idData.deleteExpenseId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should delete a specific expense by ID', async () => {
        const response = await api
            .delete(`/api/expenses/${idData.deleteExpenseId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Expense deleted!");
    });
});

describe('PUT /api/expenses/:id', () => {

    it('should fail to update expense with non-whitelist token', async () => {
        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update expense with wrong token', async () => {
        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', deleteUserToken)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update expense as draft', async () => {

        const draftUpdateData = {
            category1: "Draft",
            category2: "Draft",
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(draftUpdateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to update expense with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongExpenseDescriptionWeWillNotAcceptItVeryMuchTooLongExpenseDescriptionWeWillNotAcceptIt",
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to update expense with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update expense with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update expense with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
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

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Expense updated!');
    });

    it('should update balance of account after changing account id', async () => {
        const expenseData = {
            accountID: idData.accountDataToChangeExpenseAccountDestId,
        };

        const response = await api
            .put(`/api/expenses/${idData.testExpense2Id}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        const response2 = await api
            .get(`/api/accounts/find/${idData.accountDataToChangeExpenseAccountStartId}`)
            .set('x-access-token', userToken);

        const response3 = await api
            .get(`/api/accounts/find/${idData.accountDataToChangeExpenseAccountDestId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
        expect(response3.statusCode).toBe(200);

        expect(response2.body).toHaveProperty('availableBalance', 0);
        expect(response2.body).toHaveProperty('totalBalance', 0);
        expect(response3.body).toHaveProperty('availableBalance', -testExpenseData.amount);
        expect(response3.body).toHaveProperty('totalBalance', -testExpenseData.amount);

    });

    it('should fail to update expense with invalid file type', async () => {
        const invalidFileTypeData = {
            file: "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(invalidFileTypeData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid file type.');
    });

    it('should fail to update expense with invalid file format', async () => {
        const invalidFileFormatData = {
            file: 1234
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(invalidFileFormatData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid file format.');
    });

    it('should fail to update expense with too large file size', async () => {
        const tooLargeFileSizeData = {
            ...testExpenseData,
            file: pngTooLargeString
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(tooLargeFileSizeData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'File is too large.');
    });

    it('should update specific expense by ID with a file', async () => {
        const expenseData = {
            file: pngString
        };

        const response = await api
            .put(`/api/expenses/${idData.fileTestExpense2Id}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Expense updated!');
    });

    it('should update specific expense by ID removing its file', async () => {
        const expenseData = {
            ...testExpenseData,
            file: false
        };

        const response = await api
            .put(`/api/expenses/${idData.fileTestExpense3Id}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Expense updated!');
    });

    it('should update specific expense by ID updating its file', async () => {
        const expenseData = {
            ...testExpenseData,
            file: pngString
        };

        const response = await api
            .put(`/api/expenses/${idData.fileTestExpense4Id}`)
            .set('x-access-token', userToken)
            .send(expenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Expense updated!');
    });
});

describe('POST /api/expenses/:id', () => {
    it('should fail to create expense with non-whitelist token', async () => {
        const response = await api
            .post('/api/expenses/')
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to create expense with wrong token', async () => {
        const response = await api
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
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .put(`/api/expenses/${idData.updateExpenseId}`)
            .set('x-access-token', userToken)
            .send(draftCreateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to create expense with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongExpenseDescriptionWeWillNotAcceptItVeryMuchTooLongExpenseDescriptionWeWillNotAcceptIt",
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to create expense with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create expense with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create expense with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/expenses/')
            .set('x-access-token', userToken)
            .send(tooBigIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should create expense without file', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/expenses')
            .set('x-access-token', userToken)
            .send(newExpenseData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('amount', 10000);
        expect(response.body).toHaveProperty('category1', "Food & Drinks");
        expect(response.body).toHaveProperty('category2', "Alcohol");
    });

    it('should fail to create expense with invalid file type', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
            file: "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        };

        const response = await api
            .post('/api/expenses')
            .set('x-access-token', userToken)
            .send(newExpenseData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid file type.');
    });

    it('should fail to create expense with invalid file format', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
            file: 1234
        };

        const response = await api
            .post('/api/expenses')
            .set('x-access-token', userToken)
            .send(newExpenseData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid file format.');
    });

    it('should fail to create expense with too large file size', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
            file: pngTooLargeString
        };

        const response = await api
            .post('/api/expenses')
            .set('x-access-token', userToken)
            .send(newExpenseData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'File is too large.');
    });

    it('should create expense with file', async () => {
        const newExpenseData = {
            category1: "Food & Drinks",
            category2: "Alcohol",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
            file: pngString
        };

        const response = await api
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
        const response = await api
            .get(`/api/expenses/breakdown/${idData.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown with wrong token', async () => {
        const response = await api
            .get(`/api/expenses/breakdown/${idData.testAccountId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown without a start date', async () => {
        const response = await api
            .get(`/api/expenses/breakdown/${idData.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Start date must be present!');
    });

    it('should fail to return breakdown without an end date', async () => {
        const response = await api
            .get(`/api/expenses/breakdown/${idData.testAccountId}`)
            .set('x-access-token', userToken)
            .query({startDate: '1234'});

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'End date must be present!');
    });

    it('should return expenses breakdown', async () => {
        const response = await api
            .get(`/api/expenses/breakdown/${idData.testAccountId}`)
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