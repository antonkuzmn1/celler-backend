/*

Copyright 2024 Anton Kuzmin (https://github.com/antonkuzmn1)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import express, {Express} from 'express';
import cors from 'cors';
import {router} from './tools/router';
import {OnStartupActions} from "./tools/onStartupActions";
import {logger} from "./tools/logger";
import fs from 'fs';
import path from 'path';

const app: Express = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);

const packageJsonPath = path.resolve(__dirname, './package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

const PORT: string | 3000 = process.env.PORT || 3000;
app.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Version: ${version}`)

    const startup: OnStartupActions = new OnStartupActions();
    await startup.runAll();
});
