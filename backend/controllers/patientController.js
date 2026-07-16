import Patient from '../models/Patient.js';

export const getPatients = async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    };
  }
  const patients = await Patient.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, data: patients });
};

export const getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, data: patient });
};

export const createPatient = async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json({ success: true, data: patient });
};

export const updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, data: patient });
};

export const deletePatient = async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, message: 'Patient deleted successfully' });
};

export const addMedicalHistory = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  patient.medicalHistory.push(req.body);
  await patient.save();
  res.json({ success: true, data: patient });
};

export const deleteMedicalHistory = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  patient.medicalHistory = patient.medicalHistory.filter((h) => h._id.toString() !== req.params.historyId);
  await patient.save();
  res.json({ success: true, data: patient });
};
