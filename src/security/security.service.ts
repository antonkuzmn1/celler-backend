import {Request, Response} from 'express';
import {logger} from "../tools/logger";
import {errorResponse} from "../tools/errorResponses";
import {prisma} from "../tools/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "@prisma/client";

export interface JwtPayload {
    id: number;
}

const JWT_SECRET = process.env.JWT_SECRET

export class SecurityService {
    constructor() {
        logger.debug('SecurityService');
    }

    async getTokenByCredentials(req: Request, res: Response): Promise<Response> {
        logger.debug('SecurityService.getTokenByCredentials');

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

        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '12h'});

        logger.info(`Token received: ${token}`);
        return res.status(200).json({token: token, user: user});
    }

    async getUserByToken(req: Request, res: Response): Promise<Response> {
        logger.debug('SecurityService.getUserByToken');

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

            const user: User | null = await prisma.user.findUnique({
                where: {id: decodedToken.id, deleted: 0},
            });
            if (!user) {
                logger.error('User not found');
                return errorResponse(res, 404);
            }

            logger.info('Received data from the token:', user.username);
            return res.status(200).json(user);
        } catch (error) {
            logger.error('Server Error');
            console.error(error);
            return errorResponse(res, 500);
        }
    }

}
