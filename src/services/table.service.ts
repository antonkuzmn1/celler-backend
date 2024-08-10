import {Request, Response} from 'express';
import {prisma} from "../prisma";
import {getUserByReq} from "../utils/security.util";
import {createTableGroup, removeTableGroup} from "./group.service";

export const get = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    const tables = await prisma.table.findMany({
        where: {
            deleted: 0,
        },
        include: {
            tableGroups: true,
        }
    });

    if (!initiator.admin) {
        const initiatorGroupIds = initiator.userGroups.map(ug => ug.groupId);
        const filteredTables = tables.filter(table =>
            table.tableGroups.some(tg => initiatorGroupIds.includes(tg.groupId))
        );
        return res.status(200).json({message: filteredTables});
    }

    res.status(200).json({message: tables});
}

export const create = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator || !initiator.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const {name, title} = req.body;
    if (!name) {
        return res.status(400).json({message: 'Name is required'});
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
                initiatorId: initiator.id,
                tableId: createdTable.id,
                newValue: createdTable,
            },
        });
        res.status(201).json({message: createdTable});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error creating user'});
    }
}

export const edit = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator || !initiator.admin) {
        return res.status(403).json({message: 'Token is not valid'});
    }

    const {id, name, title} = req.body;
    if (!id || !name) {
        return res.status(400).json({message: 'ID and Name is required'});
    }

    try {
        const updatedTable = await prisma.table.update({
            where: {id},
            data: {name: name, title: title},
        });
        await prisma.log.create({
            data: {
                action: 'update',
                initiatorId: initiator.id,
                tableId: updatedTable.id,
                newValue: updatedTable,
            },
        });
        res.status(201).json({message: updatedTable});
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
}

export const remove = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator || !initiator.admin) {
        return res.status(403).json({message: 'Token is not valid'});
    }

    const id = req.body.id;
    if (!id) {
        return res.status(400).json({message: 'ID is required'});
    }

    try {
        const deletedTable = await prisma.table.update({
            where: {id},
            data: {
                deleted: 1,
            },
        });
        await prisma.log.create({
            data: {
                action: 'delete',
                initiatorId: initiator.id,
                tableId: deletedTable.id,
                newValue: deletedTable,
            },
        });
        res.status(201).json({message: deletedTable});
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
}

export const groupAdd = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator || !initiator.admin) {
        return res.status(403).json({message: 'Token is not valid'});
    }

    const {tableId, groupId} = req.body;
    if (!tableId || !groupId) {
        return res.status(400).json({message: 'IDs not found'});
    }

    const tableGroup = await createTableGroup(initiator.id, tableId, groupId);
    if (!tableGroup.success) {
        return res.status(400).json({message: tableGroup.message});
    }

    return res.status(201).json({message: tableGroup.message});
};

export const groupRemove = async (req: Request, res: Response) => {
    const initiator = await getUserByReq(req);
    if (!initiator || !initiator.admin) {
        return res.status(403).json({message: 'Token is not valid'});
    }

    const {tableId, groupId} = req.body;
    if (!tableId || !groupId) {
        return res.status(400).json({message: 'IDs not found'});
    }

    const tableGroup = await removeTableGroup(initiator.id, tableId, groupId);
    if (!tableGroup.success) {
        return res.status(400).json({message: tableGroup.message});
    }

    return res.status(201).json({message: tableGroup.message});
};
