import {Request, Response} from 'express';
import {prisma} from "../prisma";
import {getUserByReq} from "../utils/security.util";

export const get = async (req: Request, res: Response) => {
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
};

export const create = async (req: Request, res: Response) => {
    const {name, title} = req.body;

    const user = await getUserByReq(req);
    if (!user || !user.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    if (!name) {
        return res.status(400).json({message: 'Name are required'});
    }

    try {
        const createdGroup = await prisma.group.create({
            data: {
                name: name,
                title: title,
            },
        });
        await prisma.log.create({
            data: {
                action: 'create',
                initiatorId: user.id,
                groupId: createdGroup.id,
                newValue: createdGroup,
            },
        });
        res.status(201).json({newValue: createdGroup});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error creating user'});
    }
};

export const edit = async (req: Request, res: Response) => {
    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    if (!user.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const {id, name, title} = req.body;
    if (!id || !name) {
        return res.status(400).json({message: 'ID or Name not found'});
    }

    try {
        const updatedGroup = await prisma.group.update({
            where: {id},
            data: {name, title},
        });
        await prisma.log.create({
            data: {
                action: 'update',
                initiatorId: user.id,
                groupId: updatedGroup.id,
                newValue: updatedGroup,
            },
        });
        res.status(201).json({message: updatedGroup});
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
};

export const remove = async (req: Request, res: Response) => {
    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    const id = req.body.id;
    if (!id) {
        return res.status(400).json({message: 'ID not found'});
    }

    if (!user.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    try {
        const deletedGroup = await prisma.group.update({
            where: {id},
            data: {deleted: 1},
        });
        await prisma.log.create({
            data: {
                action: 'delete',
                initiatorId: user.id,
                groupId: deletedGroup.id,
                newValue: deletedGroup,
            },
        });
        res.status(201).json({
            id: deletedGroup.id,
            name: deletedGroup.name,
            title: deletedGroup.title,
            deleted: deletedGroup.deleted,
        });
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
};

export const userAdd = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator) {
        return res.status(400).json({message: 'Token is not valid'});
    }
    if (!initiator.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const {userId, groupId} = req.body;
    if (!userId || !groupId) {
        return res.status(400).json({message: 'IDs not found'});
    }

    const userGroup = await createUserGroup(initiator.id, userId, groupId);
    if (!userGroup.success) {
        return res.status(400).json({message: userGroup.message});
    }

    return res.status(201).json({message: userGroup.message});
};

export const userRemove = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator) {
        return res.status(400).json({message: 'Token is not valid'});
    }
    if (!initiator.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const {userId, groupId} = req.body;
    if (!userId || !groupId) {
        return res.status(400).json({message: 'IDs not found'});
    }

    const userGroup = await removeUserGroup(initiator.id, userId, groupId);
    if (!userGroup.success) {
        return res.status(400).json({message: userGroup.message});
    }

    return res.status(201).json({message: userGroup.message});
};

export async function createUserGroup(initiatorId: number, userId: number, groupId: number) {
    const group = await prisma.group.findUnique({
        where: {id: groupId},
    });
    if (!group) {
        return {success: false, message: 'Group not found'};
    }

    const user = await prisma.user.findUnique({
        where: {id: userId},
    });
    if (!user) {
        return {success: false, message: 'User not found'};
    }

    try {
        const userGroup = await prisma.userGroup.create({
            data: {userId, groupId},
        });
        await prisma.log.create({
            data: {
                action: 'create',
                initiatorId: initiatorId,
                targetId: userId,
                groupId: groupId,
                newValue: userGroup,
            },
        });
        return {success: true, message: userGroup};
    } catch (error) {
        return {success: false, message: 'Error creating userGroup'};
    }
}

export async function removeUserGroup(initiatorId: number, userId: number, groupId: number) {
    const userGroup = await prisma.userGroup.findUnique({
        where: {userId_groupId: {userId, groupId}},
    });
    if (!userGroup) {
        return {success: false, message: 'User is not in the specified group'};
    }

    try {
        const deletedUserGroup = await prisma.userGroup.delete({
            where: {userId_groupId: {userId, groupId}},
        });
        await prisma.log.create({
            data: {
                action: 'delete',
                initiatorId: initiatorId,
                targetId: userId,
                groupId: groupId,
            },
        });
        return {success: true, message: deletedUserGroup};
    } catch (error) {
        return {success: false, message: 'Error removing userGroup'};
    }

}
