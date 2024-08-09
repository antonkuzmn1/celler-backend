import {Router} from "express";
import {getTokenByCredentials, getUserIdFromToken} from "../services/auth.service";

export const authController = Router();

authController.post('/', getTokenByCredentials);
authController.get('/', getUserIdFromToken);
