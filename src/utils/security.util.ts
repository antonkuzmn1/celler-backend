import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from '../prisma';
import {NextFunction, Request, Response} from "express";

const JWT_SECRET = process.env.JWT_SECRET;

export interface JwtPayload {
    id: number;
}

export const generateToken = async (
    username: string,
    password: string
): Promise<{ success: boolean, message: string }> => {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is undefined');
        return {success: false, message: 'Server error'};
    }

    const user = await prisma.user.findUnique({
        where: {
            username: username,
            deleted: 0,
        }
    });
    if (!user) {
        return {success: false, message: 'User not found'};
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
        return {success: false, message: 'Incorrect password'};
    }

    const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '10m'});
    return {success: true, message: token};
}

export const getDataFromToken = async (
    token: string
): Promise<{ success: boolean, message: string | number }> => {
    try {
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is undefined');
            return {success: false, message: 'Server error'};
        }

        const tokenBearer = token && token.startsWith('Bearer ') ? token.substring(7) : null;
        if (!tokenBearer) {
            return {success: false, message: 'Token is undefined'};
        }

        const decodedRaw = jwt.verify(tokenBearer, JWT_SECRET);
        const decoded = decodedRaw as unknown as JwtPayload;
        return {success: true, message: decoded.id};
    } catch (error) {
        console.error(error);
        return {success: false, message: 'Token verification failed'};
    }
};

export const getUserByReq = async (req: Request) => {
    const token = req.headers.authorization;
    if (!token) {
        return null;
    }
    const dataFromToken = await getDataFromToken(token);
    if (!dataFromToken.success) {
        return null;
    }

    const userId = dataFromToken.message;
    if (typeof userId === 'string') {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            deleted: 0,
        },
    });
    if (!user) {
        return null;
    }

    return user;
};

export const checkUserForAdmin = async (id: number): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
            deleted: 0,
        }
    });
    if (!user) {
        return false;
    }
    return !!user.admin;
};

export const checkTokenForValidMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUserByReq(req);
        if (!user) {
            return res.status(400).json({ message: 'Token is not valid' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}
