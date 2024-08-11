import {Router} from "express";
import {get} from "./log.service";

export const logController = Router();

logController.get('/', get);
