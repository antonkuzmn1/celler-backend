import express, {response} from "express";
import {router} from "../router";
import request from "supertest";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('/api/user', () => {
    let random: number;
    let tokenAnton: string;
    let tokenRoot: string;

    beforeEach(async () => {
        jest.resetAllMocks();

        random = Math.floor(Math.random() * 100);

        const responseWithTokenForAnton = await request(app)
            .post('/api/auth')
            .send({username: 'anton', password: 'anton'});
        tokenAnton = responseWithTokenForAnton.body.token;

        const responseWithTokenForRoot = await request(app)
            .post('/api/auth')
            .send({username: 'root', password: 'root'});
        tokenRoot = responseWithTokenForRoot.body.token;
    })

    describe('get', () => {
        test('get - Authentication Required', async () => {
            const response = await request(app)
                .get('/api/user')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('get - Success', async () => {
            const response = await request(app)
                .get('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .expect('Content-Type', /json/)
                .expect(200);

            console.log(response.body[0]);
        });
    });

    describe('create', () => {
        test('create - Access Denied', async () => {
            const response = await request(app)
                .post('/api/user')
                .send({username: 'anton1', password: 'anton1'})
                .set('Authorization', `Bearer ${tokenAnton}`)
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('create - Invalid Request', async () => {
            const response = await request(app)
                .post('/api/user')
                .send({username: 'anton1'})
                .set('Authorization', `Bearer ${tokenRoot}`)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('create - Success', async () => {
            const randomExtended = `anton_${random}${random * 13}`;
            const response = await request(app)
                .post('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({
                    username: randomExtended,
                    password: randomExtended,
                    name: 'Test',
                    title: 'Created by unit tests'
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.username).toBe(randomExtended);
        });
    });

    describe('edit', () => {
        test('edit - Authentication Required', async () => {
            const response = await request(app)
                .put('/api/user')
                .send({username: 'root', password: 'root'})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('edit - Invalid Request', async () => {
            const response = await request(app)
                .put('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({username: 'anton'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('edit - Access Denied', async () => {
            const response = await request(app)
                .post('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 1, username: 'root1'})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('edit - Success', async () => {
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
        test('remove - Authentication Required', async () => {
            const response = await request(app)
                .delete('/api/user')
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('remove - Invalid Request', async () => {
            const response = await request(app)
                .delete('/api/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('remove - Access Denied', async () => {
            const response = await request(app)
                .delete('/api/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('remove - Success', async () => {
            setTimeout(async () => {
                const response = await request(app)
                    .delete('/api/user')
                    .set('Authorization', `Bearer ${tokenRoot}`)
                    .send({id: 2})
                    .expect('Content-Type', /json/)
                    .expect(201);

                expect(response.body.deleted).toBe(1);
            }, 500);
        });
    });

    describe('groupAdd', () => {
        test('groupAdd - Authentication Required', async () => {
            const response = await request(app)
                .post('/api/user/group')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('groupAdd - Access Denied', async () => {
            const response = await request(app)
                .post('/api/user/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('groupAdd - Invalid Request', async () => {
            const response = await request(app)
                .post('/api/user/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('groupAdd - Success', async () => {
            const response = await request(app)
                .post('/api/user/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 3})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.userId).toBe(2);
        });
    });

    describe('groupRemove', () => {
        test('groupRemove - Authentication Required', async () => {
            const response = await request(app)
                .delete('/api/user/group')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('groupRemove - Access Denied', async () => {
            const response = await request(app)
                .delete('/api/user/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('groupRemove - Invalid Request', async () => {
            const response = await request(app)
                .delete('/api/user/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('groupRemove - Success', async () => {
            const response = await request(app)
                .delete('/api/user/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 3})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.userId).toBe(2);
        });
    });

});
