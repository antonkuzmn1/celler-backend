import {Request, Response} from 'express';
import {prisma} from '../prisma';
import {getUserByReq} from "../utils/security.util";
import bcrypt from "bcrypt";

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
    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    const isAdmin = user.admin;
    if (!isAdmin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const {admin, username, password, name, title} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                admin: admin,
                username: username,
                password: hashedPassword,
                name: name,
                title: title,
            },
        });
        res.status(201).json({id: user.id, username: user.username});
    } catch (error) {
        res.status(500).json({message: 'Error creating user'});
    }
}
