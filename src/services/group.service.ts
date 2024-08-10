import {Request, Response} from 'express';
import {prisma} from "../prisma";
import {errorResponse} from "../utils/errorResponses.util";
import {logger} from "../logger";
import {UserGroupService} from "./userGroup.service";

export class GroupService {
    constructor() {
    }

    async getAll(_req: Request, res: Response) {
        logger.info('GroupService.getAll');

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

        const mappedGroups = groups.map((group) => {
            return {
                id: group.id,
                created: group.created,
                updated: group.updated,
                name: group.name,
                title: group.title,
                userGroups: group.userGroups.filter((userGroup) => {
                    return userGroup.user.deleted === 0
                }).map((userGroup) => {
                    return {
                        id: userGroup.user.id,
                        created: userGroup.user.created,
                        updated: userGroup.user.updated,
                        admin: userGroup.user.admin,
                        username: userGroup.user.username,
                        name: userGroup.user.name,
                        title: userGroup.user.title,
                    }
                }),
                tableGroups: group.tableGroups.filter((tableGroup) => {
                    return tableGroup.table.deleted === 0
                }).map((tableGroup) => {
                    return {
                        id: tableGroup.table.id,
                        created: tableGroup.table.created,
                        updated: tableGroup.table.updated,
                        name: tableGroup.table.name,
                        title: tableGroup.table.title,
                    }
                }),
                columnGroups: group.columnGroups.filter((columnGroup) => {
                    return columnGroup.column.deleted === 0
                }).map((columnGroup) => {
                    return {
                        id: columnGroup.column.id,
                        created: columnGroup.column.created,
                        updated: columnGroup.column.updated,
                        name: columnGroup.column.name,
                        title: columnGroup.column.title,
                    }
                }),
            }
        });

        return res.status(200).json(mappedGroups);
    }

    async create(req: Request, res: Response) {
        logger.info('GroupService.create');

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
                    initiatorId: req.initiator.id,
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
        logger.info('GroupService.edit');

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
                    initiatorId: req.initiator.id,
                    groupId: updatedGroup.id,
                    newValue: updatedGroup,
                },
            });
            return res.status(201).json({message: updatedGroup});
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.info('GroupService.remove');

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
                    initiatorId: req.initiator.id,
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
        logger.info('GroupService.userAdd');
        const userGroupService = new UserGroupService();
        await userGroupService.create(req, res);
    }

    async userRemove(req: Request, res: Response) {
        logger.info('GroupService.userRemove');
        const userGroupService = new UserGroupService();
        await userGroupService.remove(req, res);
    }

}
