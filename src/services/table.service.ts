import {Request, Response} from 'express';
import {prisma} from "../prisma";
import {logger} from "../logger";
import {errorResponse} from "../utils/errorResponses.util";
import {TableGroupService} from "./tableGroup.service";

export class TableService {
    constructor() {
    }

    async getAll(req: Request, res: Response) {
        logger.info('TableService.getAll');

        const tables = await prisma.table.findMany({
            where: {
                deleted: 0,
            },
            include: {
                tableGroups: true,
            }
        });

        if (!req.body.initiator.admin) {
            const initiatorGroupIds = req.body.initiator.userGroups.map((ug: { groupId: any; }) => ug.groupId);
            const filteredTables = tables.filter(table =>
                table.tableGroups.some(tg => initiatorGroupIds.includes(tg.groupId))
            );
            return res.status(200).json(filteredTables);
        }

        return res.status(200).json(tables);
    }

    async create(req: Request, res: Response) {
        logger.info('TableService.create');

        const {name, title} = req.body;
        if (!name) {
            return errorResponse(res, 400);
        }

        try {
            const createdTable = await prisma.table.create({
                data: {
                    name: name,
                    title: title,
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
            return res.status(201).json(createdTable);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async edit(req: Request, res: Response) {
        logger.info('TableService.edit');

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
        logger.info('TableService.remove');

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
        logger.info('TableService.groupAdd');
        const tableGroupService = new TableGroupService();
        await tableGroupService.create(req, res);
    }

    async groupRemove(req: Request, res: Response) {
        logger.info('TableService.groupRemove');
        const tableGroupService = new TableGroupService();
        await tableGroupService.remove(req, res);
    }

}
