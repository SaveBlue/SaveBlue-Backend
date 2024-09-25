import supertest from 'supertest';
import {testUserData, userToDelete, userToUpdate} from '../test_entries.js'
import {server} from '../src/server.js'
import idData from '../test_ids.json';

const api = supertest(server);

let userToken, deleteUserToken, updateUserToken;

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
});

describe('GET /api/incomes/find/:aid', () => {

    it('should fail to return data with non-whitelist token', async () => {
        const response = await api
            .get(`/api/incomes/find/${idData.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return data with wrong token', async () => {
        const response = await api
            .get(`/api/incomes/find/${idData.testAccountId}`)
            .set('x-access-token', updateUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return all incomes of an account', async () => {
        const response = await api
            .get(`/api/incomes/find/${idData.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

});

describe('GET /api/incomes/:id', () => {

    it('should fail to return income with non-whitelist token', async () => {
        const response = await api
            .get(`/api/incomes/${idData.testIncomeId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return income with wrong token', async () => {
        const response = await api
            .get(`/api/incomes/${idData.testIncomeId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return specific income by ID', async () => {
        const response = await api
            .get(`/api/incomes/${idData.testIncomeId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('description', 'Test Income');
    });

});


describe('DELETE /api/incomes/:id', () => {

    it('should fail to delete income with non-whitelist token', async () => {
        const response = await api
            .delete(`/api/incomes/${idData.deleteIncomeId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return income with wrong token', async () => {
        const response = await api
            .delete(`/api/incomes/${idData.deleteIncomeId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });


    it('should delete a specific income by ID', async () => {
        const response = await api
            .delete(`/api/incomes/${idData.deleteIncomeId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Income deleted!");
    });
});

describe('PUT /api/incomes/:id', () => {

    it('should fail to update income with non-whitelist token', async () => {
        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update income with wrong token', async () => {
        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', updateUserToken)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to update income as draft', async () => {

        const draftUpdateData = {
            category1: "Draft",
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(draftUpdateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to update income with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongIncomeDescriptionWeWillNotAcceptItVeryMuchTooLongIncomeDescriptionWeWillNotAcceptIt",
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to update income with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update income with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to update income with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(tooBigIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should update specific income by ID', async () => {
        const incomeData = {
            amount: 3333,
            description: "Updated",
        };

        const response = await api
            .put(`/api/incomes/${idData.updateIncomeId}`)
            .set('x-access-token', userToken)
            .send(incomeData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Income updated!');
    });
});


describe('POST /api/incomes/:id', () => {
    it('should fail to create income with non-whitelist token', async () => {
        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to create income with wrong token', async () => {
        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', updateUserToken)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to create income as draft', async () => {

        const draftCreateData = {
            category1: "Draft",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post(`/api/incomes/`)
            .set('x-access-token', userToken)
            .send(draftCreateData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Cannot use draft in regular account.');
    });

    it('should fail to create income with too long input', async () => {

        const tooLongDescriptionData = {
            description: "VeryMuchTooLongIncomeDescriptionWeWillNotAcceptItVeryMuchTooLongIncomeDescriptionWeWillNotAcceptIt",
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', userToken)
            .send(tooLongDescriptionData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Description too long.');
    });

    it('should fail to create income with unsafe integer amount', async () => {

        const unsafeIntegerAmountData = {
            amount: Math.pow(2, 53),
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', userToken)
            .send(unsafeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create income with negative integer amount', async () => {

        const negativeIntegerAmountData = {
            amount: -1,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', userToken)
            .send(negativeIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should fail to create income with too big integer amount', async () => {

        const tooBigIntegerAmountData = {
            amount: 100000001,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/incomes/')
            .set('x-access-token', userToken)
            .send(tooBigIntegerAmountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Amount not a valid number.');
    });

    it('should create income', async () => {
        const newIncomeData = {
            category1: "Salary & Wage",
            amount: 10000,
            userID: idData.testUserId,
            accountID: idData.testAccountId,
        };

        const response = await api
            .post('/api/incomes')
            .set('x-access-token', userToken)
            .send(newIncomeData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('amount', 10000);
        expect(response.body).toHaveProperty('category1', "Salary & Wage");
    });
});


describe('GET /api/incomes/breakdown/:aid', () => {

    it('should fail to return breakdown with non-whitelist token', async () => {
        const response = await api
            .get(`/api/incomes/breakdown/${idData.testAccountId}`)
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown with wrong token', async () => {
        const response = await api
            .get(`/api/incomes/breakdown/${idData.testAccountId}`)
            .set('x-access-token', updateUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail to return breakdown without a start date', async () => {
        const response = await api
            .get(`/api/incomes/breakdown/${idData.testAccountId}`)
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Start date must be present!');
    });

    it('should fail to return breakdown without an end date', async () => {
        const response = await api
            .get(`/api/incomes/breakdown/${idData.testAccountId}`)
            .set('x-access-token', userToken)
        .query({ startDate: '1234' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'End date must be present!');
    });

    it('should return incomes breakdown', async () => {
        const response = await api
            .get(`/api/incomes/breakdown/${idData.testAccountId}`)
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





