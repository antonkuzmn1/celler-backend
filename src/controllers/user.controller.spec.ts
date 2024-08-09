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

    describe('get', () => {
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
    });

    describe('create', () => {
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

    describe('edit', () => {
        let random: number;
        let tokenAnton: string;
        let tokenRoot: string;

        beforeAll(async () => {
            random = Math.floor(Math.random() * 100);

            const responseWithTokenForAnton = await request(app)
                .post('/api/auth')
                .send({username: 'anton', password: 'anton'});
            tokenAnton = responseWithTokenForAnton.body.token;

            const responseWithTokenForRoot = await request(app)
                .post('/api/auth')
                .send({username: 'root', password: 'root'});

            tokenRoot = responseWithTokenForRoot.body.token;
        });

        test('edit - Token is not valid', async () => {
            const response = await request(app)
                .put('/api/user')
                .send({username: 'root', password: 'root'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('edit - Username and password are required', async () => {
            const response = await request(app)
                .put('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({username: 'anton'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Username and password are required');
        });
        test('edit - Access denied #1', async () => {
            const response = await request(app)
                .post('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 1, username: 'root1'})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('edit - Access denied #2', async () => {
            const response = await request(app)
                .post('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 0, username: 'root1'})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('edit - Access denied #3', async () => {
            const response = await request(app)
                .post('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 2, password: 'anton13', title: `Random: ${random}`})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('edit - Success #1', async () => {
            const response = await request(app)
                .put('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({
                    id: 2,
                    username: 'anton',
                    password: 'anton',
                    title: `Random: ${random}`
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.title).toBe(`Random: ${random}`);
        });
        test('edit - Success #2', async () => {
            setTimeout(async () => {
                const response = await request(app)
                    .put('/api/user')
                    .set('Authorization', `Bearer ${tokenRoot}`)
                    .send({
                        id: 2,
                        username: 'anton',
                        password: 'anton',
                        title: `Random13: ${random}`,
                    })
                    .expect('Content-Type', /json/)
                    .expect(201);

                expect(response.body.title).toBe(`Random13: ${random}`);
            }, 500);
        });
    });

    describe('remove', () => {
        let tokenAnton: string;
        let tokenRoot: string;

        beforeAll(async () => {
            const responseWithTokenForAnton = await request(app)
                .post('/api/auth')
                .send({username: 'anton', password: 'anton'});
            tokenAnton = responseWithTokenForAnton.body.token;

            const responseWithTokenForRoot = await request(app)
                .post('/api/auth')
                .send({username: 'root', password: 'root'});

            tokenRoot = responseWithTokenForRoot.body.token;
        });

        test('remove - Token is not valid', async () => {
            const response = await request(app)
                .delete('/api/user')
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('edit - Username and password are required', async () => {
            const response = await request(app)
                .delete('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('ID not found');
        });
        test('edit - Access denied', async () => {
            const response = await request(app)
                .delete('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 3})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('edit - Success', async () => {
            setTimeout(async () => {
                const response = await request(app)
                    .delete('/api/user')
                    .set('Authorization', `Bearer ${tokenRoot}`)
                    .send({id: 3})
                    .expect('Content-Type', /json/)
                    .expect(201);

                expect(response.body.deleted).toBe(1);
            }, 500);
        });
    });

});
