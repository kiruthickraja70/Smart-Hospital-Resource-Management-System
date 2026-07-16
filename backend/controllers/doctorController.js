import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res) => {
  const { department, availability, search } = req.query;
  let query = {};
  if (department) query.department = department;
  if (availability) query.availability = availability;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }
  const doctors = await Doctor.find(query).sort({ name: 1 });
  res.json({ success: true, count: doctors.length, data: doctors });
};

export const getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
};

export const createDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, data: doctor });
};

export const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
};

export const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, message: 'Doctor deleted successfully' });
};

export const updateAvailability = async (req, res) => {
  const { availability } = req.body;
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { availability }, { new: true });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
};
