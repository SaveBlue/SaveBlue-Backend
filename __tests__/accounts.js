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

describe('GET /api/accounts/:uid', () => {
    it('should fail return all accounts of a user with non-whitelist token', async () => {
        const response = await api
            .get(`/api/accounts/${idData.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail return all accounts of a user with wrong token', async () => {
        const response = await api
            .get(`/api/accounts/${idData.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', deleteUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return all accounts of a user', async () => {
        const response = await api
            .get(`/api/accounts/${idData.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

});

describe('GET /api/accounts/find/:id', () => {

    it('should fail return of account with non-whitelist token', async () => {
        const response = await api
            .get(`/api/accounts/find/${idData.testAccountId}`) // Replace with a valid user ID
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail return of account with wrong token', async () => {
        const response = await api
            .get(`/api/accounts/find/${idData.testAccountId}`) // Replace with a valid user ID
            .set('x-access-token', deleteUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return specific account by ID', async () => {
        const response = await api
            .get(`/api/accounts/find/${idData.testAccountId}`) // Replace with a valid account ID
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Test Wallet');
    });

});


describe('DELETE /api/accounts/:id', () => {

    it('should fail return of account with non-whitelist token', async () => {
        const response = await api
            .delete(`/api/accounts/${idData.deleteAccountId}`) // Replace with a valid user ID
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail return of account with wrong token', async () => {
        const response = await api
            .delete(`/api/accounts/${idData.deleteAccountId}`) // Replace with a valid user ID
            .set('x-access-token', deleteUserToken);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });


    it('should delete a specific account by ID', async () => {
        const response = await api
            .delete(`/api/accounts/${idData.deleteAccountId}`) // Replace with a valid account ID
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username', testUserData.username);
    });
});

describe('PUT /api/accounts/:id', () => {

    it('should fail account update of user with non-whitelist token', async () => {
        const response = await api
            .put(`/api/accounts/${idData.updateAccountId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail account update of user with wrong token', async () => {
        const response = await api
            .put(`/api/accounts/${idData.updateAccountId}`)
            .set('x-access-token', deleteUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail account update of user with too long input', async () => {

        const badUpdatedAccountData = {
            name: "VeryMuchTooLongAccountNameWeWillNotAcceptItVeryMuchTooLongAccountNameWeWillNotAcceptIt",
        };

        const response = await api
            .put(`/api/accounts/${idData.updateAccountId}`)
            .set('x-access-token', userToken)
            .send(badUpdatedAccountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Account name too long.');
    });

    it('should update specific account\'s info by account ID', async () => {
        const updatedAccountData = {
            name: 'Updated wallet name',
        };

        const response = await api
            .put(`/api/accounts/${idData.updateAccountId}`) // Replace with a valid account ID
            .set('x-access-token', userToken)
            .send(updatedAccountData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated wallet name');
    });
});


describe('POST /api/accounts/:uid', () => {
    it('should fail account create of user with non-whitelist token', async () => {
        const response = await api
            .post(`/api/accounts/${idData.testUserId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail account create of user with wrong token', async () => {
        const response = await api
            .post(`/api/accounts/${idData.testUserId}`)
            .set('x-access-token', deleteUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail account create of user with too long input', async () => {

        const badUpdatedAccountData = {
            name: "VeryMuchTooLongAccountNameWeWillNotAcceptItVeryMuchTooLongAccountNameWeWillNotAcceptIt",
        };

        const response = await api
            .post(`/api/accounts/${idData.testUserId}`)
            .set('x-access-token', userToken)
            .send(badUpdatedAccountData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Account name too long.');
    });

    it('should create an account for a user', async () => {
        const newAccountData = {
            name: 'Sample Wallet',
        };

        const response = await api
            .post(`/api/accounts/${idData.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', userToken)
            .send(newAccountData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', newAccountData.name);
    });
});


describe('GET /api/accounts/drafts/:uid', () => {

    it('should fail return drafts account of a user with non-whitelist token', async () => {
        const response = await api
            .get(`/api/accounts/drafts/${idData.testUserId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail return drafts account of a user with wrong token', async () => {
        const response = await api
            .get(`/api/accounts/drafts/${idData.testUserId}`)
            .set('x-access-token', deleteUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return drafts account of a user', async () => {
        const response = await api
            .get(`/api/accounts/drafts/${idData.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Drafts');
    });
});





