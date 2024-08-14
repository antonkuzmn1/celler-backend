import {Request, Response} from 'express';
import {logger} from "../../tools/logger";
import {errorResponse} from "../../tools/errorResponses";
import {prisma} from "../../tools/prisma";

export class RowService {
    constructor() {
        logger.debug('RowService');
    }

    async getAll(req: Request, res: Response) {
        logger.debug('RowService.getAll');

        const tableId = req.body.tableId;
        if (!tableId || !Number(tableId)) {
            return errorResponse(res, 400);
        }

        const rows = await prisma.row.findMany({
            where: {
                deleted: 0,
                tableId: Number(tableId),
            },
            include: {
                table: {
                    include: {
                        tableGroups: true,
                    },
                },
                cells: true,
            },
        });

        if (!req.body.initiator.admin) {
            const userGroupIds = req.body.initiator.groupIds;
            const tableGroupIds = rows[0].table.tableGroups.map(
                (tableGroup: any) => tableGroup.groupId
            );
            const hasMatch = userGroupIds.some(
                (id: any) => tableGroupIds.includes(id)
            );
            if (hasMatch) {
                return res.status(200).json(rows);
            } else {
                return errorResponse(res, 403);
            }
        }

        return res.status(200).json(rows);
    }

    async create(req: Request, res: Response) {
        logger.debug('RowService.create');

        const tableId = req.body.tableId;
        if (!tableId || !Number(tableId)) {
            return errorResponse(res, 400);
        }

        if (!req.body.initiator.admin) {
            const userGroupIds = req.body.initiator.groupIds;
            const tableGroups = await prisma.tableGroupCreate.findMany({
                where: {tableId},
                select: {groupId: true},
            })
            const hasMatch = tableGroups.some(
                (tableGroup: any) => userGroupIds.includes(tableGroup.groupId)
            );
            if (!hasMatch) {
                return errorResponse(res, 403);
            }
        }


        try {
            const createdRow = await prisma.row.create({
                data: {
                    tableId: Number(tableId),
                },
                include: {
                    cells: true,
                }
            })
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    rowId: createdRow.id,
                    newValue: createdRow,
                },
            });

            const columns = await prisma.column.findMany({
                where: {
                    tableId: Number(tableId),
                    deleted: 0,
                }
            });
            try {
                await prisma.cell.createMany({
                    data: columns.map((column: any) => {
                        return {
                            tableId: Number(tableId),
                            columnId: column.id,
                            rowId: createdRow.id,
                        }
                    }),
                });
            } catch (error) {
                console.error(error);
            }
            const createdCells = await prisma.cell.findMany({
                where: {
                    tableId: Number(tableId),
                    rowId: createdRow.id,
                }
            });
            await prisma.log.createMany({
                data: createdCells.map((createdCell: any) => {
                    return {
                        action: 'create',
                        initiatorId: req.body.initiator.id,
                        cellId: createdCell.id,
                        newValue: createdCell,
                    }
                }),
            })
            createdRow.cells = createdCells;

            return res.status(201).json(createdRow);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('RowService.remove');

        const id = req.body.id;
        if (!id) {
            return errorResponse(res, 400);
        }

        if (!req.body.initiator.admin) {
            const userGroupIds = req.body.initiator.groupIds;
            const row = await prisma.row.findUnique({
                where: {id},
            })
            if (!row) {
                return errorResponse(res, 400);
            }
            const tableGroups = await prisma.tableGroupDelete.findMany({
                where: {tableId: row.tableId},
                select: {groupId: true},
            })
            const hasMatch = tableGroups.some(
                (tableGroup: any) => userGroupIds.includes(tableGroup.groupId)
            );
            if (!hasMatch) {
                return errorResponse(res, 403);
            }
        }

        try {
            const deletedRow = await prisma.row.update({
                where: {id},
                data: {
                    deleted: 1,
                },
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    columnId: deletedRow.id,
                    newValue: deletedRow,
                },
            });
            return res.status(201).json(deletedRow);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

}
