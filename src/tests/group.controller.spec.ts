import express, {response} from "express";
import {router} from "../router";
import request from "supertest";
import {userAdd} from "../services/group.service";

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
        test('get - Token is not valid', async () => {
            const response = await request(app)
                .get('/api/group')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
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
        test('create - Access denied', async () => {
            const response = await request(app)
                .post('/api/group')
                .send({name: 'group1'})
                .set('Authorization', `Bearer ${tokenAnton}`)
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('create - Name are required', async () => {
            const response = await request(app)
                .post('/api/group')
                .send({title: 'group1'})
                .set('Authorization', `Bearer ${tokenRoot}`)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Name are required');
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

            expect(response.body.newValue.name).toBe(randomExtended);
        });
    });

    describe('edit', () => {
        test('edit - Token is not valid', async () => {
            const response = await request(app)
                .put('/api/group')
                .send({id: 3, name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('edit - ID or Name not found', async () => {
            const response = await request(app)
                .put('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('ID or Name not found');
        });
        test('edit - Access denied', async () => {
            const response = await request(app)
                .post('/api/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 1, name: 'test'})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
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
        test('remove - Token is not valid', async () => {
            const response = await request(app)
                .delete('/api/group')
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('remove - ID not found', async () => {
            const response = await request(app)
                .delete('/api/group')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('ID not found');
        });
        test('remove - Access denied', async () => {
            const response = await request(app)
                .delete('/api/group')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({id: 2})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('remove - Success', async () => {
            setTimeout(async () => {
                const response = await request(app)
                    .delete('/api/group')
                    .set('Authorization', `Bearer ${tokenRoot}`)
                    .send({id: 2})
                    .expect('Content-Type', /json/)
                    .expect(201);

                expect(response.body.deleted).toBe(1);
            }, 500);
        });
    });

    describe('userAdd', () => {
        test('userAdd - Token is not valid', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('userAdd - Access denied', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('userAdd - IDs not found', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('IDs not found');
        });
        test('userAdd - Success', async () => {
            const response = await request(app)
                .post('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.message.userId).toBe(2);
        });
    });

    describe('groupRemove', () => {
        test('groupRemove - Token is not valid', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('Token is not valid');
        });
        test('groupRemove - Access denied', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenAnton}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.message).toBe('Access denied');
        });
        test('groupRemove - IDs not found', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 0, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toBe('IDs not found');
        });
        test('groupRemove - Success', async () => {
            const response = await request(app)
                .delete('/api/group/user')
                .set('Authorization', `Bearer ${tokenRoot}`)
                .send({userId: 2, groupId: 1})
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.message.userId).toBe(2);
        });
    });

});
