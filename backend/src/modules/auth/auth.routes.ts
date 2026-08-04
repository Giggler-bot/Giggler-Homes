import { Router } from 'express';

import { loginController, registerController, getMeController } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.get('/me', authenticate, getMeController);


export default authRouter;