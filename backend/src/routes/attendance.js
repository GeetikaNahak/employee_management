import express from 'express';
import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import permit from '../middleware/roleMiddleware.js';
import controller from '../controllers/attendanceController.js';
const router = Router();


// Employee endpoints
router.post('/checkin', auth, permit('employee','manager'), controller.checkin);
router.post('/checkout', auth, permit('employee','manager'), controller.checkout);
router.get('/my-history', auth, permit('employee','manager'), controller.myHistory);
router.get('/my-summary', auth, permit('employee','manager'), controller.mySummary);
router.get('/today', auth, permit('employee','manager'), controller.todayStatus);

// Manager endpoints
router.get('/all', auth, permit('manager'), controller.allAttendance);
router.get('/employee/:id', auth, permit('manager'), controller.employeeAttendance);
router.get('/summary', auth, permit('manager'), controller.teamSummary);
router.get('/export', auth, permit('manager'), controller.exportAttendanceCSV);
router.get('/today-status', auth, permit('manager'), controller.todayStatusAll);
router.get('/team-calendar', auth, permit('manager'), controller.teamCalendar);

export default router;