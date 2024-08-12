import express from "express";
import {router} from "../tools/router";
import request from "supertest";
import {UserFixture} from "./user/user.fixture";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('security', () => {
    const url: string = '/api/security';
    const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: UserFixture;
    let admin: UserFixture;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    beforeAll(async () => {
        user = await (new UserFixture(app)).init(0);
        admin = await (new UserFixture(app)).init(1);
    }, 20000);

    describe('getTokenByCredentials', () => {
        test('Without username', async () => {
            await request(app).post(url).send({
                password: user.password,
            }).expect('Content-Type', /json/).expect(400);
        });
        test('Non-existent user', async () => {
            await request(app).post(url).send({
                username: `${user.username}_${random}`,
                password: user.password,
            }).expect('Content-Type', /json/).expect(404);
        });
        test('Incorrect password', async () => {
            await request(app).post(url).send({
                username: user.username,
                password: `${user.password}_${random}`,
            }).expect('Content-Type', /json/).expect(403);
        });
        test('Success', async () => {
            await request(app).post(url).send({
                username: user.username,
                password: user.password,
            }).expect('Content-Type', /json/).expect(200);
        });
    });

    describe('getUserIdFromToken', () => {
        test('Without token', async () => {
            await request(app).get(url).expect('Content-Type', /json/).expect(401);
        });
        test('Success', async () => {
            const response = await request(app).get(url).set({
                'Authorization': user.token,
            }).expect('Content-Type', /json/).expect(200);
            expect(response.body).toBe(user.id);
        });
    });

});
