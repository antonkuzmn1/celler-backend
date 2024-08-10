// noinspection JSUnusedGlobalSymbols

import {User} from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            initiator: User & {
                id: number,
                created: Date,
                updated: Date,
                deleted: number,
                admin: number,
                username: string,
                password: string,
                name: string,
                title: string,
                userGroups: any[],
            },
        }
    }
}
