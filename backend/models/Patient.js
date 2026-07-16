import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true },
    diagnosis: { type: String },
    treatment: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: { type: String },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    medicalHistory: [medicalHistorySchema],
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text', email: 'text', phone: 'text' });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
