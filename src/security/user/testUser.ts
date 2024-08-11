import {Express} from "express";
import request from "supertest";
import {User} from "@prisma/client";
import {logger} from "../../logger/logger";

export class TestUser {

    id: number = 0;
    created: Date = new Date();
    updated: Date = new Date();
    deleted: number = 0;
    admin: 0 | 1 = 0;
    username: string = '';
    passwordHash: string = '';
    password: string = '';
    token: string = '';
    name: string = '';
    title: string = '';

    private readonly url: string = '/api/security';
    private readonly urlUser: string = '/api/security/user';
    private readonly num: number = 0;
    private readonly rootUsername: string = 'root';
    private readonly rootPassword: string = 'root';

    constructor(
        private readonly app: Express,
    ) {
        this.num = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    }

    async init(admin: 0 | 1): Promise<TestUser> {
        logger.info('TestUser.init');

        this.username = `test_user_${this.num}`;
        this.password = `test_user_${this.num}`;

        const rootToken: string = await this.getRootToken(this.rootUsername, this.rootPassword);
        const createdUser: User = await this.createUser(rootToken, admin);
        const receivedToken: string = await this.getToken(createdUser.username, createdUser.password);

        this.id = createdUser.id;
        this.created = createdUser.created;
        this.updated = createdUser.updated;
        this.deleted = createdUser.deleted;
        this.admin = createdUser.admin === 1 ? 1 : 0;
        this.username = createdUser.username;
        this.passwordHash = createdUser.password;
        this.token = receivedToken;
        this.name = createdUser.name;
        this.title = createdUser.title;

        return this;
    }

    async getJson() {
        return {
            id: this.id,
            created: this.created,
            updated: this.updated,
            deleted: this.deleted,
            admin: this.admin,
            username: this.username,
            password: this.password,
            token: this.token,
            name: this.name,
            title: this.title,
        }
    }

    private async getRootToken(username: string, password: string): Promise<string> {
        logger.info('TestUser.getRootToken');

        const receivedRootToken = await request(this.app)
            .post(this.url)
            .send({username, password});

        return `Bearer ${receivedRootToken.body}`;
    }

    private async createUser(rootToken: string, admin: 0 | 1): Promise<User> {
        logger.info('TestUser.createUser');

        const createdUser = await request(this.app)
            .post(this.urlUser)
            .set('Authorization', rootToken)
            .send({
                admin: admin,
                username: this.username,
                password: this.password,
            });

        return createdUser.body;
    }

    private async getToken(username: string, password: string): Promise<string> {
        logger.info('TestUser.getToken');

        const receivedUserToken = await request(this.app)
            .post(this.url)
            .send({username, password});

        return `Bearer ${receivedUserToken.body}`;
    }
}
