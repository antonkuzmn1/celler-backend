import {Express} from "express";
import {logger} from "../../tools/logger";
import request from "supertest";
import {User} from "@prisma/client";

export class GroupFixture {

    id: number = 0;
    created: Date = new Date();
    updated: Date = new Date();
    deleted: 0 | 1 = 0;
    name: string = '';
    title: string = '';

    private readonly url: string = '/api/security';
    private readonly urlGroup: string = '/api/security/group';
    private readonly num: number = 0;
    private readonly rootUsername: string = 'root';
    private readonly rootPassword: string = 'root';

    constructor(
        private readonly app: Express,
    ) {
        logger.debug('GroupFixture');

        this.num = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    }

    async init(): Promise<GroupFixture> {
        logger.debug('GroupFixture.init');

        this.name = `test_group_${this.num}`;

        const rootToken: string = await this.getRootToken(this.rootUsername, this.rootPassword);
        const createdGroup: User = await this.createGroup(rootToken);

        this.id = createdGroup.id;
        this.created = createdGroup.created;
        this.updated = createdGroup.updated;
        this.deleted = 0;

        return this;
    }

    private async getRootToken(username: string, password: string): Promise<string> {
        logger.debug('GroupFixture.getRootToken');

        const receivedRootToken = await request(this.app)
            .post(this.url)
            .send({username, password});

        return `Bearer ${receivedRootToken.body}`;
    }

    private async createGroup(rootToken: string): Promise<User> {
        logger.debug('GroupFixture.createGroup');

        const createdGroup = await request(this.app)
            .post(this.urlGroup)
            .set('Authorization', rootToken)
            .send({
                name: this.name,
            });

        return createdGroup.body;
    }

}
