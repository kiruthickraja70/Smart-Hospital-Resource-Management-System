import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed', 'rescheduled'],
      default: 'scheduled',
    },
    notes: { type: String },
    previousDate: { type: Date },
    previousTime: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, doctor: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
