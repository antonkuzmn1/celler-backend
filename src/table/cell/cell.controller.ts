import {Router} from "express";
import {create, edit, get, remove} from "./cell.service";

export const cellController = Router();

cellController.get('/', get);
cellController.post('/', create);
cellController.put('/', edit);
cellController.delete('/', remove);
