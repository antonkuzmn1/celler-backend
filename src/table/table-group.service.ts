import {Request, Response} from "express";
import {logger} from "../tools/logger";
import {errorResponse} from "../tools/errorResponses";
import {prisma} from "../tools/prisma";

export class TableGroupService {
    constructor() {
    }

    async create(req: Request, res: Response) {
        logger.debug('TableGroupService.create');

        const {tableId, groupId} = req.body;
        if (!tableId || !groupId) {
            logger.error('User\'s or Group\' ID is undefined');
            return errorResponse(res, 400);
        }

        const group = await prisma.group.findUnique({
            where: {id: groupId},
        });
        const table = await prisma.table.findUnique({
            where: {id: tableId},
        });
        if (!table || !group) {
            logger.error('Group not found');
            return errorResponse(res, 400);
        }

        try {
            const tableGroup = await prisma.tableGroup.create({
                data: {tableId, groupId},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    tableId: tableId,
                    groupId: groupId,
                    newValue: tableGroup,
                },
            });
            return res.status(201).json(tableGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('TableGroupService.remove');

        const {tableId, groupId} = req.body;
        if (!tableId || !groupId) {
            return errorResponse(res, 400);
        }

        const tableGroup = await prisma.tableGroup.findUnique({
            where: {tableId_groupId: {tableId, groupId}},
        });
        if (!tableGroup) {
            return errorResponse(res, 400);
        }

        try {
            const deletedTableGroup = await prisma.tableGroup.delete({
                where: {tableId_groupId: {tableId, groupId}},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    tableId: tableId,
                    groupId: groupId,
                },
            });
            return res.status(201).json(deletedTableGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

}
