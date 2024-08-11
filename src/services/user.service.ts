import {Request, Response} from 'express';
import {prisma} from '../prisma';
import bcrypt from "bcrypt";
import {logger} from "../logger";
import {errorResponse} from "../utils/errorResponses.util";
import {UserGroupService} from "./userGroup.service";

export class UserService {
    constructor() {
    }

    async getAll(_req: Request, res: Response) {
        logger.info('UserService.getAll');

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

        return res.status(200).json(mappedUsers);
    }

    async create(req: Request, res: Response) {
        logger.info('UserService.create');

        const {admin, username, password, name, title} = req.body;
        if (!username || !password) {
            return errorResponse(res, 400);
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
                    initiatorId: req.body.initiator.id,
                    targetId: createdUser.id,
                    newValue: createdUser,
                },
            });
            return res.status(201).json(createdUser);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async edit(req: Request, res: Response) {
        logger.info('UserService.edit');

        const {id, admin, username, password, name, title} = req.body;
        if (!id) {
            return errorResponse(res, 400);
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
                    initiatorId: req.body.initiator.id,
                    targetId: updatedUser.id,
                    newValue: updatedUser,
                },
            });
            return res.status(201).json(updatedUser);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async remove(req: Request, res: Response) {
        logger.info('UserService.remove');

        const id = req.body.id;
        if (!id) {
            return errorResponse(res, 400);
        }

        try {
            const deletedUser = await prisma.user.update({
                where: {id},
                data: {deleted: 1},
            });
            await prisma.log.create({
                data: {
                    action: 'delete',
                    initiatorId: req.body.initiator.id,
                    targetId: deletedUser.id,
                    newValue: deletedUser,
                },
            });
            return res.status(201).json(deletedUser);
        } catch (error) {
            return errorResponse(res, 500);
        }
    }

    async groupAdd(req: Request, res: Response) {
        logger.info('UserService.groupAdd');
        const userGroupService = new UserGroupService();
        await userGroupService.create(req, res);
    }

    async groupRemove(req: Request, res: Response) {
        logger.info('UserService.groupRemove');
        const userGroupService = new UserGroupService();
        await userGroupService.remove(req, res);
    }

}
