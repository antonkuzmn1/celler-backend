import express from "express";
import request from "supertest";
import {router} from "../../tools/router";
import {UserFixture} from "../../security/user/user.fixture";
import {GroupFixture} from "../../security/group/group.fixture";
import {TableFixture} from "../table.fixture";

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
    });

    test('e2e', async () => {
        await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(403)

        await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send()
            .expect(200)

        await request(app)
            .post('/api/table/group')
            .set('Authorization', admin.token)
            .send({
                tableId: table.id,
                groupId: group.id,
            })
            .expect(201)

        await request(app)
            .post('/api/security/user/group')
            .set('Authorization', admin.token)
            .send({
                userId: user.id,
                groupId: group.id,
            })
            .expect(201)

        const responseUser = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(200)
        expect(responseUser.body.length).toBe(1);

        const responseAdmin = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send()
            .expect(200)
        expect(responseAdmin.body.length).toBe(1);

        await request(app)
            .post(`${url}/${table.id}`)
            .set('Authorization', admin.token)
            .send({
                name,
                type: 'int',
            })
            .expect(201)

        const responseUser2 = await request(app)
            .get(`${url}/${table.id}`)
            .set('Authorization', user.token)
            .send()
            .expect(200)
        expect(responseUser2.body.length).toBe(2);
        const column = responseUser2.body[1]

        await request(app)
            .put(`${url}`)
            .set('Authorization', admin.token)
            .send({
                id: column.id,
                name: `${name}_${random}`,
            })
            .expect(201)

        await request(app)
            .delete(`${url}`)
            .set('Authorization', admin.token)
            .send({
                id: column.id,
            })
            .expect(201)
    });

});
