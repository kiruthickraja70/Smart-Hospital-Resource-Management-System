import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists with this email' });
  }

  const allowedRole = role === 'admin' ? 'patient' : role || 'patient';
  const user = await User.create({ name, email, password, role: allowedRole, phone });

  if (allowedRole === 'patient') {
    await Patient.create({ user: user._id, name, email, phone: phone || 'N/A' });
  } else if (allowedRole === 'doctor') {
    await Doctor.create({
      user: user._id,
      name,
      email,
      phone: phone || 'N/A',
      specialization: 'General Medicine',
      department: 'General Medicine',
    });
  }

  res.status(201).json({
    success: true,
    data: { user, token: generateToken(user._id) },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' });
  }
  res.json({ success: true, data: { user, token: generateToken(user._id) } });
};

export const getMe = async (req, res) => {
  let profile = null;
  if (req.user.role === 'patient') {
    profile = await Patient.findOne({ user: req.user._id });
  } else if (req.user.role === 'doctor') {
    profile = await Doctor.findOne({ user: req.user._id });
  }
  res.json({ success: true, data: { user: req.user, profile } });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, count: users.length, data: users });
};
