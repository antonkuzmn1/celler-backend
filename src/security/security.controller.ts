import {Router} from "express";
import {SecurityService} from "./security.service";
import {userController} from "./user/user.controller";
import {groupController} from "./group/group.controller";

const service = new SecurityService();

// /api/security
export const securityController = Router();

securityController.post('/', service.getTokenByCredentials);
securityController.get('/', service.getUserByToken);

securityController.use('/user', userController);
securityController.use('/group', groupController);
