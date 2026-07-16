import express from 'express';
import { getDashboardStats, getMonthlyReport, getDepartmentStats } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin', 'doctor'));

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyReport);
router.get('/departments', getDepartmentStats);

export default router;
