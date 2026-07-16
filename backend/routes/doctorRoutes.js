import express from 'express';
import {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, updateAvailability,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { doctorValidation } from '../utils/validators.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);

router.use(protect);
router.post('/', authorize('admin'), doctorValidation, validate, createDoctor);
router.put('/:id', authorize('admin'), updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);
router.patch('/:id/availability', authorize('admin', 'doctor'), updateAvailability);

export default router;
