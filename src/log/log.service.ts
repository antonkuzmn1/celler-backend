import {Request, Response} from 'express';
import {logger} from "../tools/logger";
import {prisma} from "../tools/prisma";

export interface NewLog {
    action: 'create' | 'update' | 'delete',
    newValue: any,
    initiatorId: number,
    targetId?: number,
    groupId?: number,
    tableId?: number,
    columnId?: number,
    rowId?: number,
    cellId?: number,
}

export class LogService {
    constructor() {
        logger.debug('LogService');
    }

    async getAll(_req: Request, res: Response): Promise<Response> {
        logger.debug('LogService.getAll');

        const log = await prisma.log.findMany({
            include: {
                initiator: true,
                target: true,
                group: true,
                table: true,
                column: true,
                row: true,
                cell: true,
            }
        });

        return res.status(200).json(log);
    }

}
