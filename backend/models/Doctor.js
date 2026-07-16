import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency', 'ICU', 'Surgery', 'Radiology'],
    },
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'on_leave'],
      default: 'available',
    },
    experience: { type: Number, default: 0 },
    qualification: { type: String },
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
