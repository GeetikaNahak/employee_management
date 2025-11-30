import express from 'express';
import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import permit from '../middleware/roleMiddleware.js';
import {employeeDashboard, managerDashboard} from '../controllers/dashboardController.js';
const router = Router();  

router.get('/employee', auth, permit('employee','manager'), employeeDashboard);
router.get('/manager', auth, permit('manager'), managerDashboard);

export default router;