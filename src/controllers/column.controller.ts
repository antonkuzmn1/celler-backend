import {Router} from "express";
import {create, edit, get, groupAdd, groupRemove, remove} from "../services/column.service";

export const columnController = Router();

columnController.get('/', get);
columnController.post('/', create);
columnController.put('/', edit);
columnController.delete('/', remove);

columnController.post('/group', groupAdd);
columnController.delete('/group', groupRemove);
