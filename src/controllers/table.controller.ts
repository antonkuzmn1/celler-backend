import {Router} from "express";
import {create, edit, get, groupAdd, groupRemove, remove} from "../services/table.service";

export const tableController = Router();

tableController.get('/', get);
tableController.post('/', create);
tableController.put('/', edit);
tableController.delete('/', remove);

tableController.post('/group', groupAdd);
tableController.delete('/group', groupRemove);
