import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {RowService} from "./row.service";

const sec = new SecurityMiddleware();
const service = new RowService();

// /api/table/row
export const rowController = Router();

rowController.get('/', sec.getUserFromToken, service.getAll);
rowController.post('/', sec.getUserFromToken, service.create);
rowController.delete('/', sec.getUserFromToken, service.remove);
