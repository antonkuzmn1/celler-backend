import {Router} from 'express';
import {authController} from './controllers/auth.controller';
import {userController} from "./controllers/user.controller";
import {tableController} from "./controllers/table.controller";
import {columnController} from "./controllers/column.controller";
import {rowController} from "./controllers/row.controller";
import {cellController} from "./controllers/cell.controller";
import {logController} from "./controllers/log.controller";

export const router = Router();

router.use('/auth', authController);
router.use('/user', userController);
router.use('/users', userController);
router.use('/table', tableController);
router.use('/column', columnController);
router.use('/row', rowController);
router.use('/cell', cellController);
router.use('/log', logController);
