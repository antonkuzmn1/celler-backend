import express from "express";
import {router} from "../../tools/router";
import request from "supertest";
import {UserFixture} from "./user.fixture";
import {GroupFixture} from "../group/group.fixture";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('user', () => {
    const url: string = '/api/security/user';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: UserFixture;
    let admin: UserFixture;
    const usernameAndPassword = `test_user_${random}`;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = await (new UserFixture(app)).init(0);
        admin = await (new UserFixture(app)).init(1);
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
        let rat: UserFixture;
        beforeAll(async () => {
            rat = new UserFixture(app);
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
        let rat: UserFixture;
        beforeAll(async () => {
            rat = new UserFixture(app);
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

    describe('groupAdd', () => {
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .post(`${url}/group`)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .post(`${url}/group`)
                .set('Authorization', user.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('ID cannot be null', async () => {
            await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    userId: 0,
                    groupId: rat.id
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Success', async () => {
            const response = await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.userId).toBe(user.id);
        });
    });

    describe('groupRemove', () => {
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .delete(`${url}/group`)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .delete(`${url}/group`)
                .set('Authorization', user.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(403);
        });
        test('ID cannot be null', async () => {
            await request(app)
                .delete(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    userId: 0,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Success', async () => {
            await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            const response = await request(app)
                .delete(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.userId).toBe(user.id);
        });
    });

});
