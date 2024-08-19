import {Request, Response} from 'express';
import {prisma} from "../tools/prisma";
import {logger} from "../tools/logger";
import {errorResponse} from "../tools/errorResponses";
import {TableGroupService} from "./table-group.service";

export class TableService {
    constructor() {
        logger.debug('TableService');
    }

    async getAll(req: Request, res: Response) {
        logger.debug('TableService.getAll');

        const id = Number(req.query.id);
        if (id) {
            if (!req.body.initiator.admin) {
                return errorResponse(res, 403);
            }

            const table = await prisma.table.findUnique({
                where: {
                    id,
                    deleted: 0,
                },
                include: {
                    tableGroups: {include: {group: true}},
                    tableGroupsCreate: {include: {group: true}},
                    tableGroupsDelete: {include: {group: true}},
                }
            });

            if (!table) {
                return errorResponse(res, 404);
            }

            return res.status(200).json(table);
        } else {
            const tables = await prisma.table.findMany({
                where: {
                    deleted: 0,
                },
                include: {
                    tableGroups: {include: {group: true}},
                    tableGroupsCreate: {include: {group: true}},
                    tableGroupsDelete: {include: {group: true}},
                }
            });

            if (!req.body.initiator.admin) {
                const initiatorGroupIds = req.body.initiator.userGroups.map((ug: any) => ug.groupId);
                const filteredTables = tables.filter(table =>
                    table.tableGroups.some(tg => initiatorGroupIds.includes(tg.groupId))
                );
                return res.status(200).json(filteredTables);
            }

            return res.status(200).json(tables);
        }
    }

    async create(req: Request, res: Response) {
        logger.debug('TableService.create');

        const {name, title} = req.body;
        if (!name) {
            return errorResponse(res, 400);
        }

        try {
            const createdTable = await prisma.table.create({
                data: {
                    name,
                    title
                },
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    tableId: createdTable.id,
                    newValue: createdTable,
                },
            });
            const createdColumn = await prisma.column.create({
                data: {
                    name: 'action',
                    order: 0,
                    type: 'action',
                    tableId: createdTable.id,
                }
            })
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    columnId: createdColumn.id,
                    newValue: createdColumn,
                },
            });

            return res.status(201).json(createdTable);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500);
        }
    }

    async edit(req: Request, res: Response) {
        logger.debug('TableService.edit');

        const {id, name, title} = req.body;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const updatedTable = await prisma.table.update({
                where: {id},
                data: {name: name, title: title},
            });
            await prisma.log.create({
                data: {
                    action: 'update',
                    initiatorId: req.body.initiator.id,
                    tableId: updatedTable.id,
                    newValue: updatedTable,
                },
            });
            return res.status(201).json(updatedTable);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('TableService.remove');

        const id = req.body.id;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const deletedTable = await prisma.table.update({
                where: {id},
                data: {deleted: 1},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    tableId: deletedTable.id,
                    newValue: deletedTable,
                },
            });
            return res.status(201).json(deletedTable);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async groupAdd(req: Request, res: Response) {
        logger.debug('TableService.groupAdd');
        const tableGroupService = new TableGroupService();
        await tableGroupService.addTableGroup(req, res);
    }

    async groupRemove(req: Request, res: Response) {
        logger.debug('TableService.groupRemove');
        const tableGroupService = new TableGroupService();
        await tableGroupService.removeTableGroup(req, res);
    }

    async groupCreateAdd(req: Request, res: Response) {
        logger.debug('TableService.groupCreateAdd');
        const tableGroupService = new TableGroupService();
        await tableGroupService.addTableGroupCreate(req, res);
    }

    async groupCreateRemove(req: Request, res: Response) {
        logger.debug('TableService.groupCreateRemove');
        const tableGroupService = new TableGroupService();
        await tableGroupService.removeTableGroupCreate(req, res);
    }

    async groupDeleteAdd(req: Request, res: Response) {
        logger.debug('TableService.groupDeleteAdd');
        const tableGroupService = new TableGroupService();
        await tableGroupService.addTableGroupDelete(req, res);
    }

    async groupDeleteRemove(req: Request, res: Response) {
        logger.debug('TableService.groupDeleteRemove');
        const tableGroupService = new TableGroupService();
        await tableGroupService.removeTableGroupDelete(req, res);
    }
}
