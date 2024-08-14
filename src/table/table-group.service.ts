import {Request, Response} from "express";
import {logger} from "../tools/logger";
import {errorResponse} from "../tools/errorResponses";
import {prisma} from "../tools/prisma";

export class TableGroupService {
    constructor() {
    }

    async addTableGroup(req: Request, res: Response) {
        logger.debug('TableGroupService.addTableGroup');

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

    async removeTableGroup(req: Request, res: Response) {
        logger.debug('TableGroupService.removeTableGroup');

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

    async addTableGroupCreate(req: Request, res: Response) {
        logger.debug('TableGroupService.addTableGroupsCreate');

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
            logger.error('Group or table not found');
            return errorResponse(res, 400);
        }

        try {
            const tableGroupCreate = await prisma.tableGroupCreate.create({
                data: {tableId, groupId},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    tableId: tableId,
                    groupId: groupId,
                    newValue: tableGroupCreate,
                },
            });
            return res.status(201).json(tableGroupCreate);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async removeTableGroupCreate(req: Request, res: Response) {
        logger.debug('TableGroupService.removeTableGroupsCreate');

        const {tableId, groupId} = req.body;
        if (!tableId || !groupId) {
            return errorResponse(res, 400);
        }

        const tableGroupCreate = await prisma.tableGroupCreate.findUnique({
            where: {tableId_groupId: {tableId, groupId}},
        });
        if (!tableGroupCreate) {
            return errorResponse(res, 400);
        }

        try {
            const deletedTableGroupCreate = await prisma.tableGroupCreate.delete({
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
            return res.status(201).json(deletedTableGroupCreate);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async addTableGroupDelete(req: Request, res: Response) {
        logger.debug('TableGroupService.addTableGroupDelete');

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
            logger.error('Group or table not found');
            return errorResponse(res, 400);
        }

        try {
            const tableGroupDelete = await prisma.tableGroupDelete.create({
                data: {tableId, groupId},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    tableId: tableId,
                    groupId: groupId,
                    newValue: tableGroupDelete,
                },
            });
            return res.status(201).json(tableGroupDelete);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async removeTableGroupDelete(req: Request, res: Response) {
        logger.debug('TableGroupService.removeTableGroupDelete');

        const {tableId, groupId} = req.body;
        if (!tableId || !groupId) {
            return errorResponse(res, 400);
        }

        const tableGroupDelete = await prisma.tableGroupDelete.findUnique({
            where: {tableId_groupId: {tableId, groupId}},
        });
        if (!tableGroupDelete) {
            return errorResponse(res, 400);
        }

        try {
            const deletedTableGroupDelete = await prisma.tableGroupDelete.delete({
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
            return res.status(201).json(deletedTableGroupDelete);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

}
