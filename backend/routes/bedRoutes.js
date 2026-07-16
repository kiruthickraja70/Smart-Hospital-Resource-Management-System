import express from 'express';
import {
  getBeds, getBed, createBed, updateBed, deleteBed, assignBed, releaseBed, getBedStats,
} from '../controllers/bedController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bedValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', getBeds);
router.get('/stats', getBedStats);
router.get('/:id', getBed);
router.post('/', authorize('admin'), bedValidation, validate, createBed);
router.put('/:id', authorize('admin'), updateBed);
router.delete('/:id', authorize('admin'), deleteBed);
router.put('/:id/assign', authorize('admin'), assignBed);
router.put('/:id/release', authorize('admin'), releaseBed);

export default router;
