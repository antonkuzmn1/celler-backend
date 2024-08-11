import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {prisma} from "../prisma";
import {errorResponse} from "./errorResponses.util";
import {logger} from "../logger/logger";

export class SecurityMiddleware {
    JWTSecret?: string = process.env.JWT_SECRET;

    constructor() {
    }

    getUserFromToken = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("SecurityMiddleware.getUserFromToken");
        if (!this.JWTSecret) {
            logger.error('JWT_SECRET is undefined');
            return errorResponse(res, 500);
        }

        const tokenRaw = req.headers.authorization;
        const token = tokenRaw && tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : null;
        if (!token) {
            logger.error('Token is undefined');
            return errorResponse(res, 401);
        }

        try {
            const decodedToken = jwt.verify(token, this.JWTSecret) as any;
            logger.info(decodedToken);
            if (!decodedToken || !decodedToken.id || typeof decodedToken.id !== 'number') {
                logger.error('Decoded token is undefined');
                return errorResponse(res, 401);
            }

            const user = await prisma.user.findUnique({
                where: {id: decodedToken.id, deleted: 0},
                include: {userGroups: {include: {group: true}}}
            });
            if (!user) {
                logger.error('User does not exist');
                return errorResponse(res, 401);
            }

            logger.info('User found with userId ' + decodedToken.id);
            req.body.initiator = user;
            next();
        } catch (error) {
            console.error(error);
            logger.error('Server Error');
            return errorResponse(res, 500);
        }
    }

    userShouldBeAdmin = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("SecurityMiddleware.userShouldBeAdmin");
        const user = req.body.initiator;
        if (!user) {
            logger.error('User is undefined');
            return errorResponse(res, 500);
        }

        if (!user.admin) {
            logger.error('User is not admin');
            return errorResponse(res, 403);
        }

        logger.info("User with admin");
        next();
    }
}
