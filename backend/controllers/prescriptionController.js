import Prescription from '../models/Prescription.js';

export const getPrescriptions = async (req, res) => {
  const { patient, doctor } = req.query;
  let query = {};
  if (patient) query.patient = patient;
  if (doctor) query.doctor = doctor;

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'name email phone dateOfBirth bloodGroup')
    .populate('doctor', 'name department specialization qualification')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: prescriptions.length, data: prescriptions });
};

export const getPrescription = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name email phone dateOfBirth gender bloodGroup')
    .populate('doctor', 'name department specialization qualification phone email');
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
  res.json({ success: true, data: prescription });
};

export const createPrescription = async (req, res) => {
  const prescription = await Prescription.create(req.body);
  const populated = await Prescription.findById(prescription._id)
    .populate('patient', 'name email phone dateOfBirth bloodGroup')
    .populate('doctor', 'name department specialization qualification');
  res.status(201).json({ success: true, data: populated });
};

export const deletePrescription = async (req, res) => {
  const prescription = await Prescription.findByIdAndDelete(req.params.id);
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
  res.json({ success: true, message: 'Prescription deleted successfully' });
};

export const getPatientPrescriptionHistory = async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.params.patientId })
    .populate('doctor', 'name department specialization')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: prescriptions.length, data: prescriptions });
};
