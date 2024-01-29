const request = require('supertest');
const {testUserData} = require('../test_entries')

describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {

        const userData = {
            username: 'sampleuser',
            password: 'samplepassword',
            email: 'sample@sample.com'
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(userData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username', userData.username);
    });

    it('should fail creating a new user with missing input data', async () => {

        const badUserData = {
            username: undefined,
            password: undefined,
            email: undefined
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'All data must be present');
    });

    it('should fail creating a new user with wrong email', async () => {

        const badUserData = {
            username: "badEmail",
            password: "badEmail",
            email: "badEmail"
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Email address is not valid!');
    });

    it('should fail creating a new user with too long input', async () => {

        const badUserData = {
            username: "VeryMuchTooLongUsernameWeWillNotAcceptIt",
            password: "VeryMuchTooLongUsernameWeWillNotAcceptIt",
            email: "email@email.com"
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(413);
        expect(response.body).toHaveProperty('message', 'Field too long.');
    });

    it('should fail creating a new user with the same username', async () => {

        const badUserData = {
            username: testUserData.username,
            password: testUserData.password,
            email: 'new@test.com'
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty('message', 'Duplicate username!');
    });

    it('should fail creating a new user with the same email', async () => {

        const badUserData = {
            username: 'newtestuser',
            password: testUserData.password,
            email: testUserData.email
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty('message', 'Duplicate email!');
    });

});

describe('POST /api/auth/login', () => {
    it('should fail authentication of user with missing input data', async () => {
        const loginData = {
            username: undefined,
            password: undefined
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/login')
            .send(loginData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'All data required!');
    });

    it('should fail authentication of user with wrong data', async () => {
        const loginData = {
            username: 'wrong_username',
            password: 'wrong_password'
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/login')
            .send(loginData);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Wrong username or password!');
    });

    it('should authenticate user and return 200 with a token', async () => {
        const loginData = {
            username: testUserData.username,
            password: testUserData.password
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/login')
            .send(loginData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('x-access-token');
    });

});

describe('POST /api/auth/logout', () => {
    it('should fail log out of a user with non-whitelist token', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/auth/logout')
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should log out a user and return 200 status', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/auth/logout')
            .set('x-access-token', global.JWTtoLogout);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Logged out!');
    });
});

