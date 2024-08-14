import express from "express";
import {router} from "../../tools/router";
import {UserFixture} from "../../security/user/user.fixture";
import {GroupFixture} from "../../security/group/group.fixture";
import {TableFixture} from "../table.fixture";
import {logger} from "../../tools/logger";
import request from "supertest";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Row', () => {
    const url: string = '/api/table/row';
    // const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    // const name = `test_row_${random}`;
    const user: UserFixture = new UserFixture(app);
    const admin: UserFixture = new UserFixture(app);
    const group: GroupFixture = new GroupFixture(app);
    const table: TableFixture = new TableFixture(app);
    const log = (msg: string) => {
        logger.info('');
        logger.info(msg);
        logger.info('');
    }

    beforeEach(async () => {
        jest.resetAllMocks();
    });

    beforeAll(async () => {
        await user.init(0);
        await admin.init(1);
        await group.init();
        await table.init();
        log('Test fixtures initialized');
    });

    test('e2e', async () => {
        await request(app)
            .post(url)
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(403)
        log('User cannot create a row');

        await request(app)
            .post(url)
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('Admin can create a row');

        await request(app)
            .get(url)
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(403)
        log('User cannot get a row');

        await request(app)
            .get(url)
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
            })
            .expect(200)
        log('Admin can get a row');

        await request(app)
            .post('/api/table/group')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        log('Table has been added into group');

        await request(app)
            .post('/api/security/user/group')
            .set('Authorization', admin.token)
            .send({
                userId: user.id,
                groupId: group.id,
            })
            .expect(201)
        log('User has been added into group');

        await request(app)
            .get(url)
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(200)
        log('User can get a row');

        await request(app)
            .post(url)
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(403)
        log('User cannot create row')

        await request(app)
            .post('/api/table/groupCreate')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        log('Table has been added into groupCreate');

        const row = await request(app)
            .post(url)
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('User can create a row')

        await request(app)
            .delete(url)
            .set('Authorization', user.token)
            .send({
                id: row.body.id,
            })
            .expect(403)
        log('User cannot delete a row');

        await request(app)
            .post('/api/table/groupDelete')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        log('Table has been added into groupDelete');

        await request(app)
            .delete(url)
            .set('Authorization', user.token)
            .send({
                id: row.body.id,
            })
            .expect(201)
        log('User can delete a row');
    });
});
