import {Router} from "express";
import {create, edit, get, remove, userAdd, userRemove} from "../services/group.service";

export const groupController = Router();

groupController.get('/', get);
groupController.post('/', create);
groupController.put('/', edit);
groupController.delete('/', remove);

groupController.post('/user', userAdd);
groupController.delete('/user', userRemove);
