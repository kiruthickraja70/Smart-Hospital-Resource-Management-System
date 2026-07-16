import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, unique: true },
    category: { type: String, enum: ['ICU', 'General', 'Emergency'], required: true },
    ward: { type: String, required: true },
    status: { type: String, enum: ['available', 'occupied'], default: 'available' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    occupiedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
