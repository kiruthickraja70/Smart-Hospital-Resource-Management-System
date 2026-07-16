import Bed from '../models/Bed.js';

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

const emitBedUpdate = (bed, action) => {
  if (ioInstance) {
    ioInstance.emit('bedUpdate', { bed, action });
  }
};

export const getBeds = async (req, res) => {
  const { category, status } = req.query;
  let query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  const beds = await Bed.find(query).populate('patient', 'name phone').sort({ category: 1, bedNumber: 1 });
  res.json({ success: true, count: beds.length, data: beds });
};

export const getBed = async (req, res) => {
  const bed = await Bed.findById(req.params.id).populate('patient', 'name phone email');
  if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
  res.json({ success: true, data: bed });
};

export const createBed = async (req, res) => {
  const bed = await Bed.create(req.body);
  emitBedUpdate(bed, 'created');
  res.status(201).json({ success: true, data: bed });
};

export const updateBed = async (req, res) => {
  const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('patient', 'name phone');
  if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
  emitBedUpdate(bed, 'updated');
  res.json({ success: true, data: bed });
};

export const deleteBed = async (req, res) => {
  const bed = await Bed.findByIdAndDelete(req.params.id);
  if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
  emitBedUpdate(bed, 'deleted');
  res.json({ success: true, message: 'Bed deleted successfully' });
};

export const assignBed = async (req, res) => {
  const { patientId } = req.body;
  const bed = await Bed.findById(req.params.id);
  if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
  if (bed.status === 'occupied') {
    return res.status(400).json({ success: false, message: 'Bed is already occupied' });
  }

  bed.status = 'occupied';
  bed.patient = patientId;
  bed.occupiedAt = new Date();
  await bed.save();

  const populated = await Bed.findById(bed._id).populate('patient', 'name phone');
  emitBedUpdate(populated, 'assigned');
  res.json({ success: true, data: populated });
};

export const releaseBed = async (req, res) => {
  const bed = await Bed.findById(req.params.id);
  if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
  if (bed.status === 'available') {
    return res.status(400).json({ success: false, message: 'Bed is already available' });
  }

  bed.status = 'available';
  bed.patient = null;
  bed.occupiedAt = null;
  await bed.save();

  emitBedUpdate(bed, 'released');
  res.json({ success: true, data: bed });
};

export const getBedStats = async (req, res) => {
  const stats = await Bed.aggregate([
    {
      $group: {
        _id: { category: '$category', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Bed.countDocuments();
  const occupied = await Bed.countDocuments({ status: 'occupied' });
  const available = await Bed.countDocuments({ status: 'available' });

  const byCategory = {};
  for (const cat of ['ICU', 'General', 'Emergency']) {
    const catTotal = await Bed.countDocuments({ category: cat });
    const catOccupied = await Bed.countDocuments({ category: cat, status: 'occupied' });
    byCategory[cat] = { total: catTotal, occupied: catOccupied, available: catTotal - catOccupied };
  }

  res.json({
    success: true,
    data: { total, occupied, available, occupancyRate: total ? ((occupied / total) * 100).toFixed(1) : 0, byCategory, breakdown: stats },
  });
};
