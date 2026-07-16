import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Bed from '../models/Bed.js';
import Prescription from '../models/Prescription.js';

export const getDashboardStats = async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments, totalBeds, occupiedBeds, totalPrescriptions] =
    await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'occupied' }),
      Prescription.countDocuments(),
    ]);

  const appointmentStats = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const bedByCategory = await Bed.aggregate([
    { $group: { _id: { category: '$category', status: '$status' }, count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalPrescriptions,
      beds: { total: totalBeds, occupied: occupiedBeds, available: totalBeds - occupiedBeds },
      appointmentStats,
      bedByCategory,
    },
  });
};

export const getMonthlyReport = async (req, res) => {
  const year = parseInt(req.query.year || new Date().getFullYear(), 10);

  const monthlyAppointments = await Appointment.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, status: '$status' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const monthlyPatients = await Patient.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } },
  ]);

  const monthlyPrescriptions = await Prescription.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } },
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const appointmentsByMonth = months.map((name, i) => {
    const month = i + 1;
    const scheduled = monthlyAppointments.find((a) => a._id.month === month && a._id.status === 'scheduled')?.count || 0;
    const completed = monthlyAppointments.find((a) => a._id.month === month && a._id.status === 'completed')?.count || 0;
    const cancelled = monthlyAppointments.find((a) => a._id.month === month && a._id.status === 'cancelled')?.count || 0;
    const patients = monthlyPatients.find((p) => p._id.month === month)?.count || 0;
    const prescriptions = monthlyPrescriptions.find((p) => p._id.month === month)?.count || 0;
    return { month: name, scheduled, completed, cancelled, patients, prescriptions };
  });

  res.json({ success: true, data: { year, monthly: appointmentsByMonth } });
};

export const getDepartmentStats = async (req, res) => {
  const doctorsByDept = await Doctor.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const appointmentsByDept = await Appointment.aggregate([
    { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doctorInfo' } },
    { $unwind: '$doctorInfo' },
    { $group: { _id: '$doctorInfo.department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, data: { doctorsByDept, appointmentsByDept } });
};
