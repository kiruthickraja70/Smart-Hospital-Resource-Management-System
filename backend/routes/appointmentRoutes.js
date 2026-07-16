import express from 'express';
import {
  getAppointments, getAppointment, createAppointment, cancelAppointment,
  rescheduleAppointment, getDoctorDashboard, sendReminder, completeAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { appointmentValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.get('/doctor/:doctorId/dashboard', authorize('admin', 'doctor'), getDoctorDashboard);
router.get('/:id', getAppointment);
router.post('/', authorize('admin', 'patient'), appointmentValidation, validate, createAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/complete', authorize('admin', 'doctor'), completeAppointment);
router.post('/:id/reminder', authorize('admin', 'doctor'), sendReminder);

export default router;
