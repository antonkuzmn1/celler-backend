import {Request, Response} from "express";
import {logger} from "../../tools/logger";
import {errorResponse} from "../../tools/errorResponses";
import {prisma} from "../../tools/prisma";

export class UserGroupService {
    constructor() {
    }

    async create(req: Request, res: Response) {
        logger.info('UserGroupService.create');

        const {userId, groupId} = req.body;
        if (!userId || !groupId) {
            return errorResponse(res, 400);
        }

        const group = await prisma.group.findUnique({
            where: {id: groupId},
        });
        const user = await prisma.user.findUnique({
            where: {id: userId},
        });
        if (!user || !group) {
            return errorResponse(res, 400);
        }

        try {
            const userGroup = await prisma.userGroup.create({
                data: {userId, groupId},
            });
            await prisma.log.create({
                data: {
                    action: 'create',
                    initiatorId: req.body.initiator.id,
                    targetId: userId,
                    groupId: groupId,
                    newValue: userGroup,
                },
            });
            return res.status(201).json(userGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.info('UserGroupService.remove');
        const {userId, groupId} = req.body;
        if (!userId || !groupId) {
            return errorResponse(res, 400);
        }

        const userGroup = await prisma.userGroup.findUnique({
            where: {userId_groupId: {userId, groupId}},
        });
        if (!userGroup) {
            return errorResponse(res, 400);
        }

        try {
            const deletedUserGroup = await prisma.userGroup.delete({
                where: {userId_groupId: {userId, groupId}},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    targetId: userId,
                    groupId: groupId,
                },
            });
            return res.status(201).json(deletedUserGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

}
