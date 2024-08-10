import express from "express";
import {router} from "../router";
import request from "supertest";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('/api/auth', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    test('POST - User not found', async () => {
        const reqBody = {
            username: 'root1',
            password: 'root',
        } as any;

        const response = await request(app)
            .post('/api/auth')
            .send(reqBody)
            .expect('Content-Type', /json/)
            .expect(403);

        expect(response.body.message).toBe('User not found');
    });

    test('POST - Incorrect password', async () => {
        const reqBody = {
            username: 'root',
            password: 'root1',
        } as any;

        const response = await request(app)
            .post('/api/auth')
            .send(reqBody)
            .expect('Content-Type', /json/)
            .expect(403);

        expect(response.body.message).toBe('Incorrect password');
    });

    test('POST - Success', async () => {
        const reqBody = {
            username: 'root',
            password: 'root',
        } as any;

        const response = await request(app)
            .post('/api/auth')
            .send(reqBody)
            .expect('Content-Type', /json/)
            .expect(200);

        console.log('token', response.body.token);
    });

    test('GET - Token not found', async () => {
        const response = await request(app)
            .get('/api/auth')
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toBe('Token not found');
    });

    test('GET - Success', async () => {
        const reqBodyForToken = {
            username: 'root',
            password: 'root',
        } as any;

        const responseWithToken = await request(app)
            .post('/api/auth')
            .send(reqBodyForToken)

        const token = responseWithToken.body.token;

        const response = await request(app)
            .get('/api/auth')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);

        console.log('body:', response.body);
    });
});
