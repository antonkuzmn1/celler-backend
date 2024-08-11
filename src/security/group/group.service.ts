import {Request, Response} from 'express';
import {prisma} from "../../tools/prisma";
import {errorResponse} from "../../tools/errorResponses";
import {logger} from "../../tools/logger";
import {UserGroupService} from "../user/userGroup.service";

export class GroupService {
    constructor() {
        logger.debug('GroupService');
    }

    async getAll(_req: Request, res: Response) {
        logger.debug('GroupService.getAll');

        const groups = await prisma.group.findMany({
            where: {
                deleted: 0,
            },
            include: {
                userGroups: {include: {user: true}},
                tableGroups: {include: {table: true}},
                columnGroups: {include: {column: true}},
            },
        });

        return res.status(200).json(groups);
    }

    async create(req: Request, res: Response) {
        logger.debug('GroupService.create');

        const {name, title} = req.body;
        if (!name) {
            return errorResponse(res, 400);
        }

        try {
            const createdGroup = await prisma.group.create({
                data: {name, title},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    groupId: createdGroup.id,
                    newValue: createdGroup,
                },
            });
            return res.status(201).json(createdGroup);
        } catch (error) {
            return errorResponse(res, 400);
        }
    }

    async edit(req: Request, res: Response) {
        logger.debug('GroupService.edit');

        const {id, name, title} = req.body;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const updatedGroup = await prisma.group.update({
                where: {id},
                data: {name, title},
            });
            await prisma.log.create({
                data: {
                    action: 'update',
                    initiatorId: req.body.initiator.id,
                    groupId: updatedGroup.id,
                    newValue: updatedGroup,
                },
            });
            return res.status(201).json(updatedGroup);
        } catch (error) {
            logger.error(error);
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.debug('GroupService.remove');

        const id = req.body.id;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const deletedGroup = await prisma.group.update({
                where: {id},
                data: {deleted: 1},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    groupId: deletedGroup.id,
                    newValue: deletedGroup,
                },
            });
            return res.status(201).json(deletedGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async userAdd(req: Request, res: Response) {
        logger.debug('GroupService.userAdd');

        const userGroupService = new UserGroupService();
        await userGroupService.create(req, res);
    }

    async userRemove(req: Request, res: Response) {
        logger.debug('GroupService.userRemove');

        const userGroupService = new UserGroupService();
        await userGroupService.remove(req, res);
    }

}
