import {Request, Response} from 'express';
import {logger} from "../../tools/logger";
import {prisma} from "../../tools/prisma";
import {errorResponse} from "../../tools/errorResponses";
import {ColumnGroupService} from "./column-group.service";

export class ColumnService {
    constructor() {
        logger.debug('ColumnService');
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        logger.debug('ColumnService.getAll');

        const tableId = req.query.tableId;
        if (!tableId || !Number(tableId)) {
            return errorResponse(res, 400);
        }

        const columns = await prisma.column.findMany({
            where: {
                deleted: 0,
                tableId: Number(tableId),
            },
            include: {
                table: {
                    include: {
                        tableGroups: true,
                    }
                },
            }
        })

        if (!req.body.initiator.admin) {
            const userGroupIds = req.body.initiator.groupIds;
            const tableGroupIds = (columns[0] as any).table.tableGroups.map(
                (tableGroup: any) => tableGroup.groupId
            );
            const hasMatch = userGroupIds.some(
                (id: any) => tableGroupIds.includes(id)
            );
            if (hasMatch) {
                return res.status(200).json(columns);
            } else {
                return errorResponse(res, 403);
            }
        }

        return res.status(200).json(columns);
    }

    async create(req: Request, res: Response) {
        logger.debug('ColumnService.create');

        const tableId = req.body.tableId;
        if (!tableId || !Number(tableId)) {
            return errorResponse(res, 400);
        }

        const {name, title, type, dropdown, order} = req.body;
        if (!name || !type) {
            return errorResponse(res, 400);
        }

        try {
            const createdColumn = await prisma.column.create({
                data: {
                    name,
                    title,
                    order,
                    type,
                    dropdown,
                    tableId: Number(tableId),
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

            const allColumns = await prisma.column.findMany({
                where: {
                    tableId: Number(tableId),
                }
            });
            const rowsAll = await prisma.row.findMany({
                where: {
                    tableId: Number(tableId),
                },
                include: {
                    cells: true,
                }
            });
            const rows = rowsAll.filter(row => row.cells.length < allColumns.length - 1);
            await prisma.cell.createMany({
                data: rows.map((row: any) => {
                    return {
                        tableId: Number(tableId),
                        columnId: createdColumn.id,
                        rowId: row.id,
                    }
                })
            });

            return res.status(201).json(createdColumn);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500);
        }
    }

    async edit(req: Request, res: Response) {
        logger.debug('ColumnService.edit');

        const {id, name, title, type, dropdown, order} = req.body;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const updatedColumn = await prisma.column.update({
                where: {id},
                data: {
                    name,
                    title,
                    type,
                    // @ts-ignore
                    dropdown,
                    order,
                }
            });
            await prisma.log.create({
                data: {
                    action: 'update',
                    initiatorId: req.body.initiator.id,
                    columnId: updatedColumn.id,
                    newValue: updatedColumn,
                },
            });
            return res.status(201).json(updatedColumn);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('ColumnService.remove');

        const id = req.body.id;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const deletedColumn = await prisma.column.update({
                where: {id},
                data: {
                    deleted: 1,
                    order: null,
                },
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    columnId: deletedColumn.id,
                    newValue: deletedColumn,
                },
            });
            return res.status(201).json(deletedColumn);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async groupAdd(req: Request, res: Response) {
        logger.debug('ColumnService.groupAdd');
        const columnGroupService = new ColumnGroupService();
        await columnGroupService.create(req, res);
    };

    async groupRemove(req: Request, res: Response) {
        logger.debug('ColumnService.groupRemove');
        const columnGroupService = new ColumnGroupService();
        await columnGroupService.remove(req, res);
    };

}
