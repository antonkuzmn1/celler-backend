import express from "express";
import {router} from "../tools/router";
import {UserFixture} from "../security/user/user.fixture";
import request from "supertest";
import {prisma} from "../tools/prisma";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('log', () => {
    const url: string = "/api/log";
    // const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: UserFixture;
    let admin: UserFixture;

    beforeEach(async () => {
        jest.resetAllMocks();
    })

    beforeAll(async () => {
        user = await (new UserFixture(app)).init(0);
        admin = await (new UserFixture(app)).init(1);
    }, 20000);

    describe('getAll', () => {
        test('Should have a token', async () => {
            await request(app).get(url).expect('Content-Type', /json/).expect(401);
        });
        test('Should be admin', async () => {
            await request(app).get(url).set(
                'Authorization', user.token,
            ).expect('Content-Type', /json/).expect(403);
        });
        test('Success', async () => {
            const log = await request(app).get(url).set(
                'Authorization', admin.token,
            ).expect('Content-Type', /json/).expect(200);
            console.log(log.body);
        });
    });

    describe('create', () => {
        test('Success', async () => {
            const logCountBefore = await prisma.log.count();
            const rat = new UserFixture(app);
            await rat.init(0);
            const logCountAfter = await prisma.log.count();
            expect(logCountAfter).toBeGreaterThan(logCountBefore);
        }, 20000);
    });
})
