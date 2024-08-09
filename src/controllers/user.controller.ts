import {Router} from "express";
import {create, edit, get, remove} from "../services/user.service";
import {checkTokenForValidMiddleware} from "../utils/security.util";

export const userController = Router();

userController.get('/', checkTokenForValidMiddleware, get);
userController.post('/', create);
userController.put('/', edit);
userController.delete('/', remove);
