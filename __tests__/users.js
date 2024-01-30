import request from 'supertest';
import {testUserData, userToDelete, userToUpdate} from '../test_entries.js'

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
describe('GET /api/users/me', () => {

    it('should fail return of data with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .get('/api/users/me')
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return the data of the currently logged-in user', async () => {
        const response = await request(global.__SERVER__)
            .get('/api/users/me')
            .set('x-access-token', userToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username', testUserData.username);
    });
});

describe('GET /api/users/:id', () => {

    it('should fail return of data with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/users/${global.testUserId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail return of data with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/users/${global.testUserId}`)
            .set('x-access-token', deleteUserToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should return user data for a valid user ID', async () => {
        const response = await request(global.__SERVER__)
            .get(`/api/users/${global.testUserId}`) // Replace with a valid user ID
            .set('x-access-token', userToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username');
    });
});

describe('DELETE /api/users/:id', () => {
    it('should fail delete of user with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/users/${global.deleteUserId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail delete of user with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/users/${global.deleteUserId}`)
            .set('x-access-token', userToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });


    it('should delete a user for a valid user ID', async () => {
        const response = await request(global.__SERVER__)
            .delete(`/api/users/${global.deleteUserId}`)
            .set('x-access-token', deleteUserToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted!');
    });

});

describe('PUT /api/users/:id', () => {
    it('should fail update of user with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .put(`/api/users/${global.global.updateUserId}`)
            .set('x-access-token', 'non-whitelist-token'); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail update of user with wrong token', async () => {
        const response = await request(global.__SERVER__)
            .put(`/api/users/${global.global.updateUserId}`)
            .set('x-access-token', userToken); // Assuming you have a valid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should fail update of user with too long input', async () => {

        const badUpdatedUserData = {
            username: "VeryMuchTooLongUsernameWeWillNotAcceptIt",
        };

        const response = await request(global.__SERVER__)
            .put(`/api/users/${global.global.updateUserId}`)
            .set('x-access-token', updateUserToken)
            .send(badUpdatedUserData);

        expect(response.statusCode).toBe(413);
        expect(response.body).toHaveProperty('message', 'Field too long.');
    });

    it('should update user data for a valid user ID', async () => {
        const updatedUserData = {
            username: 'updatedUsername',
        };

        const response = await request(global.__SERVER__)
            .put(`/api/users/${global.global.updateUserId}`)
            .set('x-access-token', updateUserToken)
            .send(updatedUserData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('JWT');
    });
});


