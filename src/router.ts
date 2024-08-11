import {Router} from 'express';
import {securityController} from './security/security.controller';
import {tableController} from "./table/table.controller";
import {logController} from "./logger/log.controller";

export const router = Router();

router.use('/security', securityController);
router.use('/table', tableController);
router.use('/log', logController);
