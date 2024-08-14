import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {ColumnService} from "./column.service";

const sec = new SecurityMiddleware();
const service = new ColumnService();

// /api/table/column
export const columnController = Router();

columnController.get('/', sec.getUserFromToken, service.getAll);
columnController.post('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
columnController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
columnController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

columnController.post('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupAdd);
columnController.delete('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupRemove);
