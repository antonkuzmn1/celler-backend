import express from "express";
import {router} from "../router";
import request from "supertest";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('/api/user', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    test('get - Token is not valid', async () => {
        const response = await request(app)
            .get('/api/user')
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toBe('Token is not valid');
    });

    test('get - Success', async () => {
        const reqBodyForToken = {
            username: 'root',
            password: 'root',
        } as any;

        const responseWithToken = await request(app)
            .post('/api/auth')
            .send(reqBodyForToken)

        const token = responseWithToken.body.token;

        const response = await request(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);

        console.log(response.body[0]);
    });

    test('create - Token is not valid', async () => {
        const reqBody = {
            username: 'anton',
            password: 'anton',
        } as any;

        const response = await request(app)
            .post('/api/user')
            .send(reqBody)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toBe('Token is not valid');
    });

    test('create - Access denied', async () => {
        const reqBodyForToken = {
            username: 'anton',
            password: 'anton',
        } as any;

        const responseWithToken = await request(app)
            .post('/api/auth')
            .send(reqBodyForToken)

        const token = responseWithToken.body.token;

        const reqBody = {
            username: 'anton1',
            password: 'anton1',
        } as any;

        const response = await request(app)
            .post('/api/user')
            .send(reqBody)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(403);

        expect(response.body.message).toBe('Access denied');
    });

    test('create - Username and password are required', async () => {
        const reqBodyForToken = {
            username: 'root',
            password: 'root',
        } as any;

        const responseWithToken = await request(app)
            .post('/api/auth')
            .send(reqBodyForToken)

        const token = responseWithToken.body.token;

        const reqBody = {
            username: 'anton1',
        } as any;

        const response = await request(app)
            .post('/api/user')
            .send(reqBody)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toBe('Username and password are required');
    });

    test('create - Success', async () => {
        const usernamePasswordAnswer = `anton${Math.floor(Math.random() * 100)}`;

        const reqBodyForToken = {
            username: 'root',
            password: 'root',
        } as any;

        const responseWithToken = await request(app)
            .post('/api/auth')
            .send(reqBodyForToken)

        const token = responseWithToken.body.token;

        const reqBody = {
            admin: 1,
            username: usernamePasswordAnswer,
            password: usernamePasswordAnswer,
            name: 'Test',
            title: 'Created by unit tests'
        } as any;

        const response = await request(app)
            .post('/api/user')
            .send(reqBody)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body.username).toBe(usernamePasswordAnswer);
    });

});
