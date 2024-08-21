import {Request, Response} from 'express';
import {logger} from "../../tools/logger";
import {errorResponse} from "../../tools/errorResponses";
import {prisma} from "../../tools/prisma";

export class CellService {
    constructor() {
        logger.debug('CellService');
    }

    async edit(req: Request, res: Response) {
        logger.debug('CellService.edit');

        const {
            id,
            valueInt,
            valueString,
            valueDate,
            valueBoolean,
            valueDropdown,
        } = req.body;
        if (!id) {
            return errorResponse(res, 400);
        }

        const oldCell = await prisma.cell.findUnique({
            where: {id}
        });
        if (!oldCell) {
            return errorResponse(res, 400);
        }

        if (!req.body.initiator.admin) {
            const userGroupIds = req.body.initiator.groupIds;
            const tableGroupIds = await prisma.tableGroupDelete.findMany({
                where: {tableId: oldCell.tableId},
            })
            const hasMatch = userGroupIds.some(
                (id: any) => tableGroupIds.includes(id)
            );
            if (!hasMatch) {
                return errorResponse(res, 403);
            }
        }

        try {
            const updatedCell = await prisma.cell.update({
                where: {id},
                data: {
                    valueInt,
                    valueString,
                    valueDate: new Date(valueDate),
                    valueBoolean,
                    valueDropdown: Number(valueDropdown),
                }
            });
            await prisma.log.create({
                data: {
                    action: 'update',
                    initiatorId: req.body.initiator.id,
                    cellId: updatedCell.id,
                    newValue: updatedCell,
                },
            });
            return res.status(201).json(updatedCell);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500);
        }
    }

}
