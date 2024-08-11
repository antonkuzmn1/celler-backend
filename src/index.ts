import express from 'express';
import cors from 'cors';
import {router} from './router';
import {createRootIfNotExists} from "./startup";
import {logger} from "./logger/logger";

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    await createRootIfNotExists();
});
