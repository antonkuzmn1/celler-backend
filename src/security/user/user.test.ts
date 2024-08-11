import express from "express";
import {router} from "../../tools/router";
import request from "supertest";
import {TestUser} from "./testUser";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('user', () => {
    const url: string = '/api/security/user';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: TestUser;
    let admin: TestUser;
    const usernameAndPassword = `test_user_${random}`;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = await (new TestUser(app)).init(0);
        admin = await (new TestUser(app)).init(1);
    }, 20000);

    describe('getAll', () => {
        test('Without token', async () => {
            await request(app)
                .get(url)
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Success', async () => {
            await request(app)
                .get(url)
                .set('Authorization', user.token)
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('create', () => {
        test('Access Denied', async () => {
            await request(app)
                .post(url)
                .send({
                    username: usernameAndPassword,
                    password: usernameAndPassword,
                })
                .set('Authorization', user.token)
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Invalid Request', async () => {
            await request(app)
                .post(url)
                .send({
                    username: usernameAndPassword,
                })
                .set('Authorization', admin.token)
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Success', async () => {
            const response = await request(app)
                .post(url)
                .set('Authorization', admin.token)
                .send({
                    username: usernameAndPassword,
                    password: usernameAndPassword,
                    name: 'Test',
                    title: 'Created by unit tests'
                })
                .expect('Content-Type', /json/)
                .expect(201)

            expect(response.body.username).toBe(usernameAndPassword);
        });
    });

    describe('edit', () => {
        let rat: TestUser;
        beforeAll(async () => {
            rat = new TestUser(app);
            await rat.init(0);
        }, 20000);
        test('Without token', async () => {
            await request(app)
                .put(url)
                .send({
                    username: usernameAndPassword,
                    password: usernameAndPassword,
                })
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Invalid Request', async () => {
            await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({
                    username: usernameAndPassword,
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Access Denied', async () => {
            await request(app)
                .post(url)
                .set('Authorization', user.token)
                .send({
                    id: rat.id,
                    username: `${rat.username}_${random}`,
                })
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Success', async () => {
            const response = await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({
                    id: rat.id,
                    username: `${rat.username}_${random}`,
                    password: `${rat.username}_${random}`,
                    title: `Random13: ${random}`,
                })
                .expect('Content-Type', /json/)
                .expect(201)
            expect(response.body.username).toBe(`${rat.username}_${random}`);
        });
    });

    describe('remove', () => {
        let rat: TestUser;
        beforeAll(async () => {
            rat = new TestUser(app);
            await rat.init(0);
        }, 20000);
        test('Authentication Required', async () => {
            await request(app)
                .delete(url)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Invalid Request', async () => {
            await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Access Denied', async () => {
            await request(app)
                .delete(url)
                .set('Authorization', user.token)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Success', async () => {
            const response = await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.deleted).toBe(1);
        });
    });

    // describe('groupAdd', () => {
    //     test('groupAdd - Authentication Required', async () => {
    //         const response = await request(app)
    //             .post(`${url}/group`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(401);
    //
    //         expect(response.body.message).toBe('Authentication Required');
    //     });
    //     test('groupAdd - Access Denied', async () => {
    //         const response = await request(app)
    //             .post('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenAnton}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(403);
    //
    //         expect(response.body.message).toBe('Access Denied');
    //     });
    //     test('groupAdd - Invalid Request', async () => {
    //         const response = await request(app)
    //             .post('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 0, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //
    //         expect(response.body.message).toBe('Invalid Request');
    //     });
    //     test('groupAdd - Success', async () => {
    //         const response = await request(app)
    //             .post('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 2, groupId: 3})
    //             .expect('Content-Type', /json/)
    //             .expect(201);
    //
    //         expect(response.body.userId).toBe(2);
    //     });
    // });

    // describe('groupRemove', () => {
    //     test('groupRemove - Authentication Required', async () => {
    //         const response = await request(app)
    //             .delete('/api/user/group')
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(401);
    //
    //         expect(response.body.message).toBe('Authentication Required');
    //     });
    //     test('groupRemove - Access Denied', async () => {
    //         const response = await request(app)
    //             .delete('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenAnton}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(403);
    //
    //         expect(response.body.message).toBe('Access Denied');
    //     });
    //     test('groupRemove - Invalid Request', async () => {
    //         const response = await request(app)
    //             .delete('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 0, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //
    //         expect(response.body.message).toBe('Invalid Request');
    //     });
    //     test('groupRemove - Success', async () => {
    //         const response = await request(app)
    //             .delete('/api/user/group')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 2, groupId: 3})
    //             .expect('Content-Type', /json/)
    //             .expect(201);
    //
    //         expect(response.body.userId).toBe(2);
    //     });
    // });

});
