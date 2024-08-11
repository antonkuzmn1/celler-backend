import {Request, Response} from 'express';
import {logger} from "../logger/logger";
import {errorResponse} from "./errorResponses.util";
import {prisma} from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "@prisma/client";

export interface JwtPayload {
    id: number;
}

const JWT_SECRET = process.env.JWT_SECRET

export class SecurityService {
    constructor() {
    }

    async getTokenByCredentials(req: Request, res: Response): Promise<Response> {
        logger.info('SecurityService.getTokenByCredentials');

        if (!JWT_SECRET) {
            logger.error('JWT_SECRET is undefined');
            return errorResponse(res, 500);
        }

        const {username, password} = req.body;
        if (!username || !password) {
            logger.error('Username or Password is undefined');
            return errorResponse(res, 400);
        }

        const user: User | null = await prisma.user.findUnique({
            where: {username, deleted: 0}
        });
        if (!user) {
            logger.error('User not found');
            return errorResponse(res, 404);
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            logger.error('Passwords do not match');
            return errorResponse(res, 403);
        }

        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '10m'});

        logger.info(`Token received: ${token}`);
        return res.status(200).json(token);
    }

    async getUserIdFromToken(req: Request, res: Response): Promise<Response> {
        logger.info('SecurityService.getUserIdFromToken');

        if (!JWT_SECRET) {
            logger.error('JWT_SECRET is undefined');
            return errorResponse(res, 500);
        }

        const tokenRaw: string | undefined = req.headers.authorization;
        if (!tokenRaw) {
            logger.error('Token is undefined');
            return errorResponse(res, 401);
        }

        const token: string | null = tokenRaw && tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : null;
        if (!token) {
            logger.error('Token is undefined');
            return errorResponse(res, 401);
        }

        try {
            const decodedToken: JwtPayload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
            if (!decodedToken.id) {
                logger.error('Decoded token is undefined');
                return errorResponse(res, 500);
            }

            logger.info('Received data from the token:', decodedToken);
            return res.status(200).json(decodedToken.id);
        } catch (error) {
            logger.error('Server Error');
            return errorResponse(res, 500);
        }
    }

}
