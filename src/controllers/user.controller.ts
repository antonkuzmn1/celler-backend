import {Router} from "express";
import {create, get} from "../services/user.service";
import {checkTokenForValidMiddleware} from "../utils/security.util";

export const userController = Router();

userController.get('/', checkTokenForValidMiddleware, get);
userController.post('/', create);
userController.put('/', );
userController.delete('/', );
