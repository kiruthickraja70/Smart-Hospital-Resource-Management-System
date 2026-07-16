import express from 'express';
import {
  getPrescriptions, getPrescription, createPrescription, deletePrescription, getPatientPrescriptionHistory,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prescriptionValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', getPrescriptions);
router.get('/patient/:patientId', getPatientPrescriptionHistory);
router.get('/:id', getPrescription);
router.post('/', authorize('admin', 'doctor'), prescriptionValidation, validate, createPrescription);
router.delete('/:id', authorize('admin', 'doctor'), deletePrescription);

export default router;
