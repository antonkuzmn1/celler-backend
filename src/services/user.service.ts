import {Request, Response} from 'express';
import {prisma} from '../prisma';
import {getUserByReq} from "../utils/security.util";
import bcrypt from "bcrypt";
import { Prisma } from '@prisma/client';

export const get = async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        where: {
            deleted: 0,
        },
        include: {
            userGroups: {
                include: {
                    group: true,
                }
            }
        },
    });
    const mappedUsers = users.map((user) => {
        return {
            id: user.id,
            created: user.created,
            updated: user.updated,
            admin: user.admin,
            username: user.username,
            name: user.name,
            title: user.title,
            userGroups: user.userGroups.filter((userGroup) => {
                return userGroup.group.deleted === 0
            }).map((userGroup) => {
                return {
                    since: userGroup.created,
                    groupId: userGroup.group.id,
                    groupCreated: userGroup.group.created,
                    groupUpdated: userGroup.group.updated,
                    groupName: userGroup.group.name,
                    groupTitle: userGroup.group.title,
                }
            }),
        }
    });
    res.status(200).json(mappedUsers);
}

export const create = async (req: Request, res: Response) => {
    const {admin, username, password, name, title} = req.body;

    const user = await getUserByReq(req);
    if (!user || !user.admin) {
        return res.status(403).json({message: 'Access denied'});
    }

    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await prisma.user.create({
            data: {
                admin: admin,
                username: username,
                password: hashedPassword,
                name: name,
                title: title,
            },
        });
        await prisma.log.create({
            data: {
                action: 'create',
                initiatorId: user.id,
                targetId: createdUser.id,
                newValue: createdUser,
            },
        });
        res.status(201).json({id: createdUser.id, username: createdUser.username});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error creating user'});
    }
}

export const edit = async (req: Request, res: Response) => {
    const {id, admin, username, password, name, title} = req.body;

    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    const isAdmin = user.admin;
    if (!isAdmin) {
        if (user.id !== id) {
            return res.status(403).json({message: 'Access denied'});
        }

        const targetUser = await prisma.user.findUnique({where: {id}});
        if (!targetUser) {
            return res.status(403).json({message: 'Access denied'});
        }

        try {
            const passwordIsValid = await bcrypt.compare(password, targetUser.password);
            if (!passwordIsValid) {
                return res.status(403).json({message: 'Access denied'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedUser = await prisma.user.update({
                where: {id},
                data: {
                    username: username,
                    password: hashedPassword,
                    name: name,
                    title: title,
                },
            });
            await prisma.log.create({
                data: {
                    action: 'update',
                    initiatorId: user.id,
                    targetId: updatedUser.id,
                    newValue: updatedUser,
                },
            });
            res.status(201).json({
                id: updatedUser.id,
                username: updatedUser.username,
                name: updatedUser.name,
                title: updatedUser.title,
            });
        } catch (error) {
            res.status(500).json({message: 'Error creating user'});
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await prisma.user.update({
            where: {id},
            data: {
                admin: admin,
                username: username,
                password: hashedPassword,
                name: name,
                title: title,
            },
        });
        await prisma.log.create({
            data: {
                action: 'update',
                initiatorId: user.id,
                targetId: updatedUser.id,
                newValue: updatedUser,
            },
        });
        res.status(201).json({
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            title: updatedUser.title,
        });
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
}

export const remove = async (req: Request, res: Response) => {
    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    const id = req.body.id;
    if (!id) {
        return res.status(400).json({message: 'ID not found'});
    }

    const isAdmin = user.admin;
    if (!isAdmin) {
        return res.status(403).json({message: 'Access denied'});
    }

    try {
        const deletedUser = await prisma.user.update({
            where: {id},
            data: {
                deleted: 1,
            },
        });
        await prisma.log.create({
            data: {
                action: 'delete',
                initiatorId: user.id,
                targetId: deletedUser.id,
                newValue: deletedUser,
            },
        });
        res.status(201).json({
            id: deletedUser.id,
            username: deletedUser.username,
            name: deletedUser.name,
            title: deletedUser.title,
            deleted: deletedUser.deleted,
        });
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
}

export const groupAdd = async (req: Request, res: Response) => {

};

export const groupRemove = async (req: Request, res: Response) => {

};
