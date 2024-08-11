import {Router} from "express";
import {UserService} from "./user.service";
import {SecurityMiddleware} from "../security.middleware";

const sec = new SecurityMiddleware();
const service = new UserService();

export const userController = Router();

userController.get('/', sec.getUserFromToken, service.getAll);
userController.post('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
userController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
userController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

userController.post('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupAdd);
userController.delete('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupRemove);
