const request = require('supertest');

const userData = {
    username: 'testuser',
    password: 'testpassword',
    email: 'test@test.com'
};
describe('POST /api/auth/register', () => {
    it('should create a new user and return 200 status', async () => {

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(userData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username', userData.username);
    });

    it('should fail creating a new user with the same username and return 409 status', async () => {

        const badUserData = {
            username: userData.username,
            password: userData.password,
            email: 'new@test.com'
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty('message', 'Duplicate username!');
    });

    it('should fail creating a new user with the same email and return 409 status', async () => {

        const badUserData = {
            username: 'newtestuser',
            password: userData.password,
            email: userData.email
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/register')
            .send(badUserData);

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty('message', 'Duplicate email!');
    });

});

describe('POST /api/auth/login', () => {
    it('should fail authentication of user with wrong data and return 401', async () => {
        const loginData = {
            username: 'wrong_username',
            password: 'wrong_password'
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/login')
            .send(loginData);

        console.log(response.body)

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Wrong username or password!');
    });

    it('should authenticate user and return 200 with a token', async () => {
        const loginData = {
            username: userData.username,
            password: userData.password
        };

        const response = await request(global.__SERVER__)
            .post('/api/auth/login')
            .send(loginData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('x-access-token');

        global.jwtToken = response.body['x-access-token']
    });

});

describe('POST /api/auth/logout', () => {
    it('should fail log out of a user with non-whitelist token and return 200 status', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/auth/logout')
            .set('x-access-token', 'non-whitelist-token');

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized!');
    });

    it('should log out a user and return 200 status', async () => {
        const response = await request(global.__SERVER__)
            .post('/api/auth/logout')
            .set('x-access-token', global.jwtToken);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Logged out!');
    });
});

