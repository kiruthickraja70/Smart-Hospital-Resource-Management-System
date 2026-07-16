import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReminder,
} from '../utils/emailService.js';

export const getAppointments = async (req, res) => {
  const { status, doctor, patient, date } = req.query;
  let query = {};
  if (status) query.status = status;
  if (doctor) query.doctor = doctor;
  if (patient) query.patient = patient;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name department specialization')
    .sort({ date: -1, time: 1 });

  res.json({ success: true, count: appointments.length, data: appointments });
};

export const getAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone bloodGroup')
    .populate('doctor', 'name department specialization email phone');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, data: appointment });
};

export const createAppointment = async (req, res) => {
  const { patient, doctor, date, time, reason, notes } = req.body;

  const existing = await Appointment.findOne({
    doctor,
    date: new Date(date),
    time,
    status: { $in: ['scheduled', 'rescheduled'] },
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Doctor already has an appointment at this time' });
  }

  const appointment = await Appointment.create({ patient, doctor, date, time, reason, notes });
  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name department specialization');

  const patientDoc = await Patient.findById(patient);
  const doctorDoc = await Doctor.findById(doctor);
  if (patientDoc && doctorDoc) {
    try {
      await sendAppointmentConfirmation(populated, patientDoc, doctorDoc);
    } catch (e) {
      console.error('Email send failed:', e.message);
    }
  }

  res.status(201).json({ success: true, data: populated });
};

export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (appointment.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Appointment already cancelled' });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name department specialization');

  const patientDoc = await Patient.findById(appointment.patient);
  const doctorDoc = await Doctor.findById(appointment.doctor);
  if (patientDoc && doctorDoc) {
    try {
      await sendAppointmentCancellation(populated, patientDoc, doctorDoc);
    } catch (e) {
      console.error('Email send failed:', e.message);
    }
  }

  res.json({ success: true, data: populated });
};

export const rescheduleAppointment = async (req, res) => {
  const { date, time } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const conflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor: appointment.doctor,
    date: new Date(date),
    time,
    status: { $in: ['scheduled', 'rescheduled'] },
  });
  if (conflict) {
    return res.status(400).json({ success: false, message: 'Doctor already has an appointment at this time' });
  }

  appointment.previousDate = appointment.date;
  appointment.previousTime = appointment.time;
  appointment.date = date;
  appointment.time = time;
  appointment.status = 'rescheduled';
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name department specialization');

  const patientDoc = await Patient.findById(appointment.patient);
  const doctorDoc = await Doctor.findById(appointment.doctor);
  if (patientDoc && doctorDoc) {
    try {
      await sendAppointmentConfirmation(populated, patientDoc, doctorDoc);
    } catch (e) {
      console.error('Email send failed:', e.message);
    }
  }

  res.json({ success: true, data: populated });
};

export const getDoctorDashboard = async (req, res) => {
  const { doctorId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppointments, upcoming, completed, cancelled] = await Promise.all([
    Appointment.find({ doctor: doctorId, date: { $gte: today, $lt: tomorrow }, status: { $in: ['scheduled', 'rescheduled'] } })
      .populate('patient', 'name phone email')
      .sort({ time: 1 }),
    Appointment.find({ doctor: doctorId, date: { $gte: tomorrow }, status: { $in: ['scheduled', 'rescheduled'] } })
      .populate('patient', 'name phone')
      .sort({ date: 1, time: 1 })
      .limit(10),
    Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
    Appointment.countDocuments({ doctor: doctorId, status: 'cancelled' }),
  ]);

  res.json({
    success: true,
    data: { todayAppointments, upcoming, stats: { completed, cancelled } },
  });
};

export const sendReminder = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name department');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  try {
    await sendAppointmentReminder(appointment, appointment.patient, appointment.doctor);
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send reminder' });
  }
};

export const completeAppointment = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: 'completed' },
    { new: true }
  ).populate('patient', 'name email').populate('doctor', 'name department');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, data: appointment });
};
