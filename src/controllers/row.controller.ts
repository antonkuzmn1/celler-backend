import {Router} from "express";
import {create, edit, get, remove} from "../services/row.service";

export const rowController = Router();

rowController.get('/', get);
rowController.post('/', create);
rowController.put('/', edit);
rowController.delete('/', remove);
