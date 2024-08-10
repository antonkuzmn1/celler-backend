import {Router} from "express";
import {create, edit, get, remove, userAdd, userRemove} from "../services/group.service";
import {checkTokenForValidMiddleware} from "../utils/security.util";

export const groupController = Router();

groupController.get('/', checkTokenForValidMiddleware, get);
groupController.post('/', create);
groupController.put('/', edit);
groupController.delete('/', remove);

groupController.post('/user', userAdd);
groupController.delete('/user', userRemove);
