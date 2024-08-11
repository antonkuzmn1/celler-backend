import express, {Express} from 'express';
import cors from 'cors';
import {router} from './tools/router';
import {OnStartupActions} from "./tools/onStartupActions";
import {logger} from "./tools/logger";

const app: Express = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);

const PORT: string | 3000 = process.env.PORT || 3000;
app.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);

    const startup: OnStartupActions = new OnStartupActions();
    await startup.runAll();
});
