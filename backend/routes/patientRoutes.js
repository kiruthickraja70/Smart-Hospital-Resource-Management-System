import express from 'express';
import {
  getPatients, getPatient, createPatient, updatePatient, deletePatient,
  addMedicalHistory, deleteMedicalHistory,
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { patientValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'doctor'), getPatients);
router.get('/:id', authorize('admin', 'doctor', 'patient'), getPatient);
router.post('/', authorize('admin'), patientValidation, validate, createPatient);
router.put('/:id', authorize('admin'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);
router.post('/:id/medical-history', authorize('admin', 'doctor'), addMedicalHistory);
router.delete('/:id/medical-history/:historyId', authorize('admin', 'doctor'), deleteMedicalHistory);

export default router;
