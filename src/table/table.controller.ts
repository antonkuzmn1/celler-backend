import {Router} from "express";
import {SecurityMiddleware} from "../security/security.middleware";
import {TableService} from "./table.service";
import {columnController} from "./column/column.controller";
import {rowController} from "./row/row.controller";
import {cellController} from "./cell/cell.controller";

const sec = new SecurityMiddleware();
const service = new TableService();

export const tableController = Router();

tableController.get('/', sec.getUserFromToken, service.getAll);
tableController.post('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.create);
tableController.put('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.edit);
tableController.delete('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.remove);

tableController.post('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupAdd);
tableController.delete('/group', sec.getUserFromToken, sec.userShouldBeAdmin, service.groupRemove);

tableController.use('/column', columnController);
tableController.use('/row', rowController);
tableController.use('/cell', cellController);
