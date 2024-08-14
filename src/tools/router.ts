import {Router} from 'express';
import {securityController} from '../security/security.controller';
import {tableController} from "../table/table.controller";
import {logController} from "../log/log.controller";

// /api
export const router = Router();

router.use('/security', securityController);
router.use('/table', tableController);
router.use('/log', logController);
