import {Router} from "express";
import {get} from "../services/log.service";

export const logController = Router();

logController.get('/', get);
