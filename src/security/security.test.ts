import express from "express";
import {router} from "../tools/router";
import request from "supertest";
import {TestUser} from "./user/testUser";

const app = express();
app.use(express.json());
app.use('/api', router);

const url: string = '/api/security';

describe(url, () => {
    let random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    let user: TestUser;
    let admin: TestUser;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    beforeAll(async () => {
        user = await (new TestUser(app)).init(0);
        admin = await (new TestUser(app)).init(1);
    }, 20000);

    describe('getTokenByCredentials', () => {
        test('Without username', () => {
            request(app).post(url).send({
                password: user.password,
            }).expect('Content-Type', /json/).expect(400);
        });
        test('Non-existent user', () => {
            request(app).post(url).send({
                username: `${user.username}_${random}`,
                password: user.password,
            }).expect('Content-Type', /json/).expect(404);
        });
        test('Incorrect password', () => {
            request(app).post(url).send({
                username: user.username,
                password: `${user.password}_${random}`,
            }).expect('Content-Type', /json/).expect(403);
        });
        test('Success', () => {
            request(app).post(url).send({
                username: user.username,
                password: user.password,
            }).expect('Content-Type', /json/).expect(200);
        });
    });

    describe('getUserIdFromToken', () => {
        test('Without token', () => {
            request(app).get(url).set({
                'Authorization': user.token,
            }).expect('Content-Type', /json/).expect(401);
        });
        test('Success', () => {
            request(app).get(url).set({
                'Authorization': user.token,
            }).expect('Content-Type', /json/).expect(200).then(
                response => expect(response.body).toBe(user.id),
            );
        });
    });

});
