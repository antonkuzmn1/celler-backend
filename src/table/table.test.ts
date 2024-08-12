import express from "express";
import {router} from "../tools/router";
import request from "supertest";
import {UserFixture} from "../security/user/user.fixture";
import {GroupFixture} from "../security/group/group.fixture";
import {TableFixture} from "./table.fixture";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Table', () => {
    const url: string = '/api/table';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: UserFixture;
    let admin: UserFixture;
    const name = `test_table_${random}`;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = new UserFixture(app);
        await user.init(0);
        admin = new UserFixture(app);
        await admin.init(1);
    });

    describe('getAll', () => {
        let ratTable1: TableFixture;
        let ratTable2: TableFixture;
        let ratGroup: GroupFixture;
        beforeAll(async () => {
            ratTable1 = new TableFixture(app);
            await ratTable1.init();
            ratTable2 = new TableFixture(app);
            await ratTable2.init();
            ratGroup = new GroupFixture(app);
            await ratGroup.init();
        }, 20000 * 3);
        test('Should get 1 table for user, and more than 1 for admin', async () => {
            await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    tableId: ratTable1.id,
                    groupId: ratGroup.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            await request(app)
                .post(`/api/security/group/user`)
                .set('Authorization', admin.token)
                .send({
                    userId: user.id,
                    groupId: ratGroup.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            const responseUser = await request(app)
                .get(url)
                .set('Authorization', user.token)
                .send()
                .expect('Content-Type', /json/)
                .expect(200);
            expect(responseUser.body.length).toBe(1);
            const responseAdmin = await request(app)
                .get(url)
                .set('Authorization', admin.token)
                .send()
                .expect('Content-Type', /json/)
                .expect(200);
            expect(responseAdmin.body.length).toBeGreaterThanOrEqual(2);
        }, 20000);
    });

    describe('create', () => {
        test('Should have a name field', async () => {
            await request(app)
                .post(url)
                .send({title: 'table1'})
                .set('Authorization', admin.token)
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Should be create a new table', async () => {
            const response = await request(app)
                .post(url)
                .set('Authorization', admin.token)
                .send({
                    name,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.name).toBe(name);
        });
    });

    describe('edit', () => {
        let rat: TableFixture;
        beforeAll(async () => {
            rat = new TableFixture(app);
            await rat.init();
        }, 20000);
        test('Should have an ID field', async () => {
            await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({
                    title: 'table1',
                })
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Should be patch a name', async () => {
            const response = await request(app)
                .put(url)
                .set('Authorization', admin.token)
                .send({
                    id: rat.id,
                    name: `${rat.name}_${random}`,
                    title: `Random13: ${random}`
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.name).toBe(`${rat.name}_${random}`);
            expect(response.body.title).toBe(`Random13: ${random}`);
        });
    });

    describe('remove', () => {
        let rat: TableFixture;
        beforeAll(async () => {
            rat = new TableFixture(app);
            await rat.init();
        }, 20000);
        test('Should have an ID field', async () => {
            await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send()
                .expect('Content-Type', /json/)
                .expect(400);
        });
        test('Should set deleted to 1', async () => {
            const response = await request(app)
                .delete(url)
                .set('Authorization', admin.token)
                .send({
                    id: rat.id
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.deleted).toBe(1);
        });
    });

    describe('groupAdd', () => {
        let ratTable: TableFixture;
        let ratGroup: GroupFixture;
        beforeAll(async () => {
            ratTable = new TableFixture(app);
            await ratTable.init();
            ratGroup = new GroupFixture(app);
            await ratGroup.init();
        }, 20000 * 2);
        test('Should create a M2M relationship', async () => {
            const response = await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    tableId: ratTable.id,
                    groupId: ratGroup.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response.body.tableId).toBe(ratTable.id);
        });
    });

    describe('groupRemove', () => {
        let ratTable: TableFixture;
        let ratGroup: GroupFixture;
        beforeAll(async () => {
            ratTable = new TableFixture(app);
            await ratTable.init();
            ratGroup = new GroupFixture(app);
            await ratGroup.init();
        }, 20000 * 2);
        test('Should delete a M2M relationship', async () => {
            const response1 = await request(app)
                .post(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    tableId: ratTable.id,
                    groupId: ratGroup.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response1.body.tableId).toBe(ratTable.id);
            const response2 = await request(app)
                .delete(`${url}/group`)
                .set('Authorization', admin.token)
                .send({
                    tableId: ratTable.id,
                    groupId: ratGroup.id,
                })
                .expect('Content-Type', /json/)
                .expect(201);
            expect(response2.body.tableId).toBe(ratTable.id);
        });
    });

});
