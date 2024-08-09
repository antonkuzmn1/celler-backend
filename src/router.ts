import {Router} from 'express';
import {authController} from './controllers/auth.controller';
import {userController} from "./controllers/user.controller";

export const router = Router();

router.use('/auth', authController);
router.use('/user', userController);
