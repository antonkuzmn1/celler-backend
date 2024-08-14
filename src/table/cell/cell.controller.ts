import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {CellService} from "./cell.service";

const sec = new SecurityMiddleware();
const service = new CellService();

// /api/table/cell
export const cellController = Router();

cellController.put('/', sec.getUserFromToken, service.edit);
