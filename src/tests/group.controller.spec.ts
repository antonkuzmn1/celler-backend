import express from "express";
import {router} from "../router";
import request from "supertest";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('/api/group', () => {
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
                .get('/api/group')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('get - Success', async () => {
            const response = await request(app)
                .get('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .expect('Content-Type', /json/)
                .expect(200);

            console.log(response.body[0]);
        });
    });

    describe('create', () => {
        test('create - Access Denied', async () => {
            const response = await request(app)
                .post('/api/group')
                .send({name: 'group1'})
                .set('Authorization', `Bearer ${tokenAnton}`)
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('create - Invalid Request', async () => {
            const response = await request(app)
                .post('/api/group')
                .send({title: 'group1'})
                .set('Authorization', `Bearer ${tokenRoot}`)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('create - Success', async () => {
            const randomExtended = `group_${random}${random * 13}`;
            const response = await request(app)
                .post('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({
                    name: randomExtended,
                    title: 'Created by unit tests'
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.name).toBe(randomExtended);
        });
    });

    describe('edit', () => {
        test('edit - Authentication Required', async () => {
            const response = await request(app)
                .put('/api/group')
                .send({id: 3, name: 'test'})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('edit - Access Denied', async () => {
            const response = await request(app)
                .post('/api/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 1, name: 'test'})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('edit - Invalid Request', async () => {
            const response = await request(app)
                .put('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('edit - Success', async () => {
            const randomExtended = `group_${random}${random * 13}`;
            const response = await request(app)
                .put('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({
                    id: 3,
                    name: randomExtended,
                    title: `Random13: ${random}`,
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.message.name).toBe(randomExtended);
            expect(response.body.message.title).toBe(`Random13: ${random}`);
        });
    });

    describe('remove', () => {
        test('remove - Authentication Required', async () => {
            const response = await request(app)
                .delete('/api/group')
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('remove - Access Denied', async () => {
            const response = await request(app)
                .delete('/api/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('remove - Invalid Request', async () => {
            const response = await request(app)
                .delete('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('remove - Success', async () => {
            const response = await request(app)
                .delete('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.deleted).toBe(1);
        });
    });

    describe('userAdd', () => {
        test('userAdd - Authentication Required', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('userAdd - Access Denied', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('userAdd - Invalid Request', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('userAdd - Success', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.userId).toBe(2);
        });
    });

    describe('userRemove', () => {
        test('userRemove - Authentication Required', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.message).toBe('Authentication Required');
        });
        test('userRemove - Access Denied', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access Denied');
        });
        test('userRemove - Invalid Request', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Invalid Request');
        });
        test('userRemove - Success', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.userId).toBe(2);
        });
    });

});
