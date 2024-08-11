import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {prisma} from "../prisma";
import {errorResponse} from "../utils/errorResponses.util";
import {logger} from "../logger";

export class SecurityMiddleware {
    JWTSecret?: string = process.env.JWT_SECRET;

    constructor() {
    }

    getUserFromToken = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Getting user from token");
        if (!this.JWTSecret) {
            return errorResponse(res, 500);
        }

        const tokenRaw = req.headers.authorization;
        const token = tokenRaw && tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : null;
        if (!token) {
            return errorResponse(res, 401);
        }

        const decodedToken = jwt.verify(token, this.JWTSecret) as any;
        if (!decodedToken || !decodedToken.id || typeof decodedToken.id !== 'number') {
            return errorResponse(res, 401);
        }

        const user = await prisma.user.findUnique({
            where: {id: decodedToken.id, deleted: 0},
            include: {userGroups: {include: {group: true}}}
        });
        if (!user) {
            return errorResponse(res, 401);
        }

        req.body.initiator = user;
        next();
    }

    userShouldBeAdmin = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Getting user with admin");
        const user = req.body.initiator;
        if (!user) {
            return errorResponse(res, 500);
        }

        if (!user.admin) {
            return errorResponse(res, 403);
        }

        logger.info("User with admin");
        next();
    }
}
