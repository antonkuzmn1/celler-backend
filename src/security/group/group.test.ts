import express from "express";
import {router} from "../../tools/router";
import request from "supertest";
import {TestUser} from "../user/testUser";
import {TestGroup} from "./testGroup";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('group', () => {
    const url: string = '/api/security/group';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: TestUser;
    let admin: TestUser;
    const name = `test_group_${random}`;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = await (new TestUser(app)).init(0);
        admin = await (new TestUser(app)).init(1);
    }, 20000);

    describe('getAll', () => {
        test('Should have a token', async () => {
            await request(app)
                .get(url)
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .get(url)
                .set('Authorization', user.token)
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Success', async () => {
            await request(app)
                .get(url)
                .set('Authorization', admin.token)
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('create', () => {
        test('Should be admin', async () => {
            await request(app)
                .post(url)
                .send({name})
                .set('Authorization', user.token)
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Should have a name', async () => {
            await request(app)
                .post(url)
                .send({title: name})
                .set('Authorization', admin.token)
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Success', async () => {
            const response = await request(app)
                .post(url)
                .set('Authorization', admin.token)
                .send({
                    name,
                    title: 'Created by unit tests'
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.name).toBe(name);
        });
    });

    describe('edit', () => {
        let rat: TestGroup;
        beforeAll(async () => {
            rat = new TestGroup(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .put(url)
                .send({id: rat.id, name: `${name}_${random}`})
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .post(url)
                .set('Authorization', user.token)
                .send({id: rat.id, name: `${name}_${random}`})
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Should have ID', async () => {
            await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({name: `${name}_${random}`})
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('edit - Success', async () => {
            const response = await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({
                    id: 3,
                    name: `${name}_${random}`,
                    title: `Random13: ${random}`})
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.name).toBe(`${name}_${random}`);
            expect(response.body.title).toBe(`Random13: ${random}`);
        });
    });

    describe('remove', () => {
        let rat: TestGroup;
        beforeAll(async () => {
            rat = new TestGroup(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .delete(url)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .delete(url)
                .set('Authorization', user.token)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('Should have ID', async () => {
            await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send({id: 0})
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('remove - Success', async () => {
            const response = await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send({id: rat.id})
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.deleted).toBe(1);
        });
    });

    // describe('userAdd', () => {
    //     test('userAdd - Authentication Required', async () => {
    //         const response = await request(app)
    //             .post('/api/group/user')
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(401);
    //
    //         expect(response.body.message).toBe('Authentication Required');
    //     });
    //     test('userAdd - Access Denied', async () => {
    //         const response = await request(app)
    //             .post('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenAnton}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(403);
    //
    //         expect(response.body.message).toBe('Access Denied');
    //     });
    //     test('userAdd - Invalid Request', async () => {
    //         const response = await request(app)
    //             .post('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 0, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //
    //         expect(response.body.message).toBe('Invalid Request');
    //     });
    //     test('userAdd - Success', async () => {
    //         const response = await request(app)
    //             .post('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(201);
    //
    //         expect(response.body.userId).toBe(2);
    //     });
    // });

    // describe('userRemove', () => {
    //     test('userRemove - Authentication Required', async () => {
    //         const response = await request(app)
    //             .delete('/api/group/user')
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(401);
    //
    //         expect(response.body.message).toBe('Authentication Required');
    //     });
    //     test('userRemove - Access Denied', async () => {
    //         const response = await request(app)
    //             .delete('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenAnton}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(403);
    //
    //         expect(response.body.message).toBe('Access Denied');
    //     });
    //     test('userRemove - Invalid Request', async () => {
    //         const response = await request(app)
    //             .delete('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 0, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(400);
    //
    //         expect(response.body.message).toBe('Invalid Request');
    //     });
    //     test('userRemove - Success', async () => {
    //         const response = await request(app)
    //             .delete('/api/group/user')
    //             .set('Authorization', `Bearer ${tokenRoot}`)
    //             .send({userId: 2, groupId: 1})
    //             .expect('Content-Type', /json/)
    //             .expect(201);
    //
    //         expect(response.body.userId).toBe(2);
    //     });
    // });

});
