import express from "express";
import request from "supertest";
import {router} from "../../tools/router";
import {UserFixture} from "../../security/user/user.fixture";
import {GroupFixture} from "../../security/group/group.fixture";
import {TableFixture} from "../table.fixture";
import {logger} from "../../tools/logger";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Column', () => {
    const url: string = '/api/table/column';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    const name = `test_column_${random}`;
    const user: UserFixture = new UserFixture(app);
    const admin: UserFixture = new UserFixture(app);
    const group: GroupFixture = new GroupFixture(app);
    const table: TableFixture = new TableFixture(app);

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        await user.init(0);
        await admin.init(1);
        await group.init();
        await table.init();
        logger.info('Test fixtures initialized');
    });

    test('e2e', async () => {
        await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(403)
        logger.info('User cannot get a table without groups');

        await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send()
            .expect(200)
        logger.info('Admin can get the all tables');

        await request(app)
            .post('/api/table/group')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        logger.info('Table has been added into group');

        await request(app)
            .post('/api/security/user/group')
            .set('Authorization', admin.token)
            .send({
                userId: user.id,
                groupId: group.id,
            })
            .expect(201)
        logger.info('User has been added into group');

        const responseUser = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(200)
        expect(responseUser.body.length).toBe(1);
        logger.info('User gets only 1 table cuz it have general group');

        const responseAdmin = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send()
            .expect(200)
        expect(responseAdmin.body.length).toBe(1);
        logger.info('Admin cat get the all tables');

        await request(app)
            .post(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send({
                name,
                type: 'int',
            })
            .expect(201)
        logger.info('Created column');

        const responseUser2 = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(200)
        expect(responseUser2.body.length).toBe(2);
        const column = responseUser2.body[1]
        logger.info('User gets a 2 columns whit general group');

        await request(app)
            .put(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send({
                id: column.id,
                name: `${name}_${random}`,
            })
            .expect(201)
        logger.info('Updated some fields of column');

        await request(app)
            .delete(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send({
                id: column.id,
            })
            .expect(201)
        logger.info('Deleted the column');

        await request(app)
            .post(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send({
                name,
                type: 'int',
            })
            .expect(201)
        logger.info('Created a new column');

        await request(app)
            .post(`${url}/${table.id}/group`)
            .set('Authorization', admin.token)
            .send({
                columnId: column.id,
                groupId: group.id,
            })
            .expect(201)
        logger.info('Added new column into group');

        await request(app)
            .delete(`${url}/${table.id}/group`)
            .set('Authorization', admin.token)
            .send({
                columnId: column.id,
                groupId: group.id,
            })
            .expect(201);
        logger.info('Removed column from group');

    });

});
