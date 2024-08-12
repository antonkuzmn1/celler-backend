import express from "express";
import {router} from "../../tools/router";
import request from "supertest";
import {UserFixture} from "../user/user.fixture";
import {GroupFixture} from "./group.fixture";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('group', () => {
    const url: string = '/api/security/group';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: UserFixture;
    let admin: UserFixture;
    const name = `test_group_${random}`;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = await (new UserFixture(app)).init(0);
        admin = await (new UserFixture(app)).init(1);
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
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
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
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
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

    describe('userAdd', () => {
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .post(`${url}/user`)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .post(`${url}/user`)
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
                .post(`${url}/user`)
                .set('Authorization', admin.token)
                .send({
                    userId: 0,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Success', async () => {
            const response = await request(app)
                .post(`${url}/user`)
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

    describe('userRemove', () => {
        let rat: GroupFixture;
        beforeAll(async () => {
            rat = new GroupFixture(app);
            await rat.init();
        }, 20000);
        test('Should have a token', async () => {
            await request(app)
                .delete(`${url}/user`)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(401);
        });
        test('Should be admin', async () => {
            await request(app)
                .delete(`${url}/user`)
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
                .delete(`${url}/user`)
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
                .post(`${url}/user`)
                .set('Authorization', admin.token)
                .send({
                    userId: user.id,
                    groupId: rat.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            const response = await request(app)
                .delete(`${url}/user`)
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
