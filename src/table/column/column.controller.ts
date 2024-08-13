import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {ColumnService} from "./column.service";

const sec = new SecurityMiddleware();
const service = new ColumnService();

export const columnController = Router();

columnController.get('/:id', sec.getUserFromToken, service.getAll);
columnController.post('/:id', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
columnController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
columnController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

columnController.post('/group', );
columnController.delete('/group', );
