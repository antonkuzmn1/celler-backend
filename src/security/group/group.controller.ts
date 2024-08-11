import {Router} from "express";
import {GroupService} from "./group.service";
import {SecurityMiddleware} from "../security.middleware";

const sec = new SecurityMiddleware();
const service = new GroupService();

export const groupController = Router();

groupController.get('/', sec.getUserFromToken, service.getAll);
groupController.post('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
groupController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
groupController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

groupController.post('/user', sec.getUserFromToken, sec.userShouldBeAdmin, service.userAdd);
groupController.delete('/user', sec.getUserFromToken, sec.userShouldBeAdmin, service.userRemove);
