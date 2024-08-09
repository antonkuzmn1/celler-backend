import {Request, Response} from 'express';
import {generateToken, getDataFromToken} from "../utils/security.util";

export const getTokenByCredentials = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }

    const tokenResponse = await generateToken(username, password);
    if (!tokenResponse.success) {
        switch (tokenResponse.message) {
            case 'Server error':
                return res.status(404).json({message: tokenResponse.message});
            case 'User not found':
                return res.status(403).json({message: tokenResponse.message});
            case 'Incorrect password':
                return res.status(403).json({message: tokenResponse.message});
        }
    }

    res.status(200).json({token: tokenResponse.message});
}

export const getUserIdFromToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({message: 'Token not found'});
    }

    const data = await getDataFromToken(token);
    if (!data.success || typeof data.message === "string") {
        return res.status(403).json({message: 'Token is not valid'});
    }

    res.status(200).json({id: data.message});
}
