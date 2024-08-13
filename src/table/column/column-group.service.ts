import {Request, Response} from "express";
import {logger} from "../../tools/logger";
import {errorResponse} from "../../tools/errorResponses";
import {prisma} from "../../tools/prisma";

export class ColumnGroupService {
    constructor() {
    }

    async create(req: Request, res: Response) {
        logger.debug('ColumnGroupService.create');

        const {columnId, groupId} = req.body;
        if (!columnId || !groupId) {
            console.error(1);
            return errorResponse(res, 400);
        }

        const group = await prisma.group.findUnique({
            where: {id: groupId},
        });
        const column = await prisma.column.findUnique({
            where: {id: columnId},
        });
        if (!group || !column) {
            console.error(2);
            return errorResponse(res, 400);
        }

        try {
            const columnGroup = await prisma.columnGroup.create({
                data: {columnId, groupId},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    columnId,
                    groupId,
                    newValue: columnGroup,
                }
            });
            return res.status(201).json(columnGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('ColumnGroupService.remove');

        const {columnId, groupId} = req.body;
        if (!columnId || !groupId) {
            return errorResponse(res, 400);
        }

        const columnGroup = await prisma.columnGroup.findUnique({
            where: {columnId_groupId: {columnId, groupId}},
        });
        if (!columnGroup) {
            return errorResponse(res, 400);
        }

        try {
            const deletedColumnGroup = await prisma.columnGroup.delete({
                where: {columnId_groupId: {columnId, groupId}},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    columnId,
                    groupId,
                }
            })
            return res.status(201).json(deletedColumnGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }
}
