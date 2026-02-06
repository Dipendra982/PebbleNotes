
const request = require('supertest');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

describe('open API Tests', () => {
    //     it('should create a new user', async () => { -- 10 times(10 ota hunu paryo)

    it('should create a new user', async () => {
        const uniqueUsername = `testuser_${Date.now()}`;
        const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

        const res = await request(BASE_URL)
            .post('/api/users/register')
            .send({
                username: uniqueUsername,
                email: uniqueEmail,
                password: 'securepassword123'
            });

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.user.email).toBe(uniqueEmail);
    });
});

            
