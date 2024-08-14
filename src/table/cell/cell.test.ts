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

describe('Cell', () => {
    // const url: string = '/api/table/cell';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    const name = `test_row_${random}`;
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

        /// CREATE 3 ROWS

        await request(app)
            .post('/api/table/row')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('Admin can create a row #1');

        await request(app)
            .post('/api/table/row')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('Admin can create a row #2');

        await request(app)
            .post('/api/table/row')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('Admin can create a row #3');

        /// ADD INTO THE GROUPS

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
            .post('/api/table/group')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        log('Table has been added into group');

        await request(app)
            .post('/api/table/groupCreate')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)
        log('Table has been added into groupCreate');

        await request(app)
            .post('/api/table/column')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                name,
                type: 'int',
            })
            .expect(201)
        log('User can create a column');

        await request(app)
            .post('/api/table/row')
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('User can create a row #1')

        await request(app)
            .post('/api/table/row')
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('User can create a row #2')

        await request(app)
            .post('/api/table/row')
            .set('Authorization', user.token)
            .send({
                tableId: table.id,
            })
            .expect(201)
        log('User can create a row #3')

        await request(app)
            .post('/api/table/column')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                name,
                type: 'int',
            })
            .expect(201)
        log('User can create a column');
    });
});
