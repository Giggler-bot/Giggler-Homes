import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRoles.js';
import { getAdminDashboard } from './admin.controller.js';

const adminRouter = Router();

adminRouter.get('/dashboard', authenticate, authorizeRoles('ADMIN'), getAdminDashboard());

export default adminRouter;