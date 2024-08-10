import {Router} from "express";
import {SecurityMiddleware} from "../middleware/security.middleware";
import {TableService} from "../services/table.service";

const sec = new SecurityMiddleware();
const service = new TableService();

export const tableController = Router();

tableController.get('/', sec.getUserFromToken, service.getAll);
tableController.post('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
tableController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
tableController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

tableController.post('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupAdd);
tableController.delete('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupRemove);
