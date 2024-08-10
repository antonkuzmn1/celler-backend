import {Request, Response} from 'express';
import {prisma} from "../prisma";
import {errorResponse} from "../utils/errorResponses.util";
import {logger} from "../logger";

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

        res.status(200).json(mappedGroups);
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
            res.status(201).json(createdGroup);
        } catch (error) {
            return errorResponse(res, 400);
        }
    }

    async edit(req: Request, res: Response) {
        logger.info('GroupService.edit');

        const {id, name, title} = req.body;
        if (!id || !name) {
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
            res.status(201).json({message: updatedGroup});
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
            res.status(201).json(deletedGroup);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async userAdd(req: Request, res: Response) {
        logger.info('GroupService.userAdd');

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
                    initiatorId: req.initiator.id,
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

    async userRemove(req: Request, res: Response) {
        logger.info('GroupService.userRemove');
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
                    initiatorId: req.initiator.id,
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

export async function createTableGroup(initiatorId: number, tableId: number, groupId: number) {
    const group = await prisma.group.findUnique({
        where: {id: groupId},
    });
    if (!group) {
        return {success: false, message: 'Group not found'};
    }

    const table = await prisma.table.findUnique({
        where: {id: tableId},
    });
    if (!table) {
        return {success: false, message: 'User not found'};
    }

    try {
        const createdTableGroup = await prisma.tableGroup.create({
            data: {tableId, groupId},
        });
        await prisma.log.create({
            data: {
                action: 'create',
                initiatorId: initiatorId,
                tableId: tableId,
                groupId: groupId,
                newValue: createdTableGroup,
            },
        });
        return {success: true, message: createdTableGroup};
    } catch (error) {
        return {success: false, message: 'Error creating userGroup'};
    }
}

export async function removeTableGroup(initiatorId: number, tableId: number, groupId: number) {
    const userGroup = await prisma.tableGroup.findUnique({
        where: {tableId_groupId: {tableId, groupId}},
    });
    if (!userGroup) {
        return {success: false, message: 'User is not in the specified group'};
    }

    try {
        const deletedTableGroup = await prisma.tableGroup.delete({
            where: {tableId_groupId: {tableId, groupId}},
        });
        await prisma.log.create({
            data: {
                action: 'delete',
                initiatorId: initiatorId,
                tableId: tableId,
                groupId: groupId,
            },
        });
        return {success: true, message: deletedTableGroup};
    } catch (error) {
        return {success: false, message: 'Error removing userGroup'};
    }

}
