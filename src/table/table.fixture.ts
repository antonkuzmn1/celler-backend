import {Express} from "express";
import request from "supertest";
import {Table} from "@prisma/client";
import {logger} from "../tools/logger";

export class TableFixture {

    id: number = 0;
    created: Date = new Date();
    updated: Date = new Date();
    deleted: 0 | 1 = 0;
    name: string = '';
    title: string = '';

    private readonly urlSecurity: string = '/api/security';
    private readonly urlTable: string = '/api/table';
    private readonly num: number = 0;
    private readonly rootUsername: string = 'root';
    private readonly rootPassword: string = 'root';

    constructor(
        private readonly app: Express,
    ) {
        logger.debug('TableFixture');

        this.num = Math.floor(Math.random() * 100 * 100 * 100 * 100);
    }

    async init(): Promise<TableFixture> {
        logger.debug('TableFixture.init');

        this.name = `test_table_${this.num}`;

        const rootToken: string = await this.getRootToken(this.rootUsername, this.rootPassword);
        const createdTable: Table = await this.createTable(rootToken);

        this.id = createdTable.id;
        this.created = createdTable.created;
        this.updated = createdTable.updated;

        logger.info(`TableFixture.init - successfully - ID=${this.id} - NAME=${this.name}`);
        return this;
    }

    private async getRootToken(username: string, password: string): Promise<string> {
        logger.debug('TableFixture.getRootToken');

        const receivedRootToken = await request(this.app)
            .post(this.urlSecurity)
            .send({username, password});

        return `Bearer ${receivedRootToken.body}`;
    }

    private async createTable(rootToken: string): Promise<Table> {
        logger.debug('TableFixture.createTable');

        const createdTable = await request(this.app)
            .post(this.urlTable)
            .set('Authorization', rootToken)
            .send({
                name: this.name,
            });

        return createdTable.body;
    }

}
