import {Request, Response} from 'express';
import {prisma} from '../prisma';
import {getUserByReq} from "../utils/security.util";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
    const user = await getUserByReq(req);
    if (!user) {
        return res.status(400).json({message: 'Token is not valid'});
    }

    const isAdmin = user.admin;
    if (!isAdmin) {
        return res.status(403).json({message: 'Access denied'});
    }

    const admin = req.body.admin;
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const title = req.body.title;

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
