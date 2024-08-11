import {Router} from 'express';
import {securityController} from './security/security.controller';
import {userController} from "./security/user/user.controller";
import {groupController} from "./security/group/group.controller";
import {tableController} from "./table/table.controller";
import {columnController} from "./table/column.controller";
import {rowController} from "./table/row.controller";
import {cellController} from "./table/cell.controller";
import {logController} from "./logger/log.controller";

export const router = Router();

router.use('/security', securityController);
router.use('/table', tableController);
router.use('/log', logController);
