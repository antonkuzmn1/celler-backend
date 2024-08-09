import {Router} from "express";
import {createUser} from "../services/user.service";

export const userController = Router();

userController.get('/', );
userController.post('/', createUser);
userController.put('/', );
userController.delete('/', );
