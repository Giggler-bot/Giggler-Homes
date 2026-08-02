import { Router } from 'express';

import { registercontroller } from './auth.controller.js';

const authRouter = Router();

authRouter.post('/register', registercontroller);

export default authRouter;