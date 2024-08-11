import {Router} from "express";
import {LogService} from "./log.service";
import {SecurityMiddleware} from "../security/security.middleware";

const service = new LogService();
const sec = new SecurityMiddleware();

export const logController = Router();

logController.get('/', sec.getUserFromToken, sec.userShouldBeAdmin, service.getAll);
