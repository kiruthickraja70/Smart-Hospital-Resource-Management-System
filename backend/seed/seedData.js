import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Bed from '../models/Bed.js';
import Prescription from '../models/Prescription.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(), Patient.deleteMany(), Doctor.deleteMany(),
      Appointment.deleteMany(), Bed.deleteMany(), Prescription.deleteMany(),
    ]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });

    const doctorUsers = await User.create([
      { name: 'Dr. Sarah Johnson', email: 'sarah@hospital.com', password: 'doctor123', role: 'doctor', phone: '9876543211' },
      { name: 'Dr. Michael Chen', email: 'michael@hospital.com', password: 'doctor123', role: 'doctor', phone: '9876543212' },
      { name: 'Dr. Emily Davis', email: 'emily@hospital.com', password: 'doctor123', role: 'doctor', phone: '9876543213' },
    ]);

    const patientUsers = await User.create([
      { name: 'John Smith', email: 'john@patient.com', password: 'patient123', role: 'patient', phone: '9876543220' },
      { name: 'Jane Doe', email: 'jane@patient.com', password: 'patient123', role: 'patient', phone: '9876543221' },
      { name: 'Robert Wilson', email: 'robert@patient.com', password: 'patient123', role: 'patient', phone: '9876543222' },
    ]);

    const doctors = await Doctor.create([
      { user: doctorUsers[0]._id, name: 'Dr. Sarah Johnson', email: 'sarah@hospital.com', phone: '9876543211', specialization: 'Cardiologist', department: 'Cardiology', availability: 'available', experience: 12, qualification: 'MD, FACC' },
      { user: doctorUsers[1]._id, name: 'Dr. Michael Chen', email: 'michael@hospital.com', phone: '9876543212', specialization: 'Neurologist', department: 'Neurology', availability: 'available', experience: 8, qualification: 'MD, PhD' },
      { user: doctorUsers[2]._id, name: 'Dr. Emily Davis', email: 'emily@hospital.com', phone: '9876543213', specialization: 'Pediatrician', department: 'Pediatrics', availability: 'available', experience: 6, qualification: 'MD, FAAP' },
    ]);

    const patients = await Patient.create([
      { user: patientUsers[0]._id, name: 'John Smith', email: 'john@patient.com', phone: '9876543220', dateOfBirth: new Date('1985-03-15'), gender: 'male', bloodGroup: 'O+', address: '123 Main St, City', emergencyContact: { name: 'Mary Smith', phone: '9876543299', relation: 'Spouse' }, medicalHistory: [{ condition: 'Hypertension', diagnosis: 'Stage 1 Hypertension', treatment: 'Lisinopril 10mg', date: new Date('2024-01-10'), notes: 'Monitor blood pressure weekly' }] },
      { user: patientUsers[1]._id, name: 'Jane Doe', email: 'jane@patient.com', phone: '9876543221', dateOfBirth: new Date('1990-07-22'), gender: 'female', bloodGroup: 'A+', address: '456 Oak Ave, City', emergencyContact: { name: 'Tom Doe', phone: '9876543298', relation: 'Brother' }, medicalHistory: [{ condition: 'Asthma', diagnosis: 'Mild persistent asthma', treatment: 'Albuterol inhaler', date: new Date('2023-06-05'), notes: 'Use inhaler as needed' }] },
      { user: patientUsers[2]._id, name: 'Robert Wilson', email: 'robert@patient.com', phone: '9876543222', dateOfBirth: new Date('1978-11-30'), gender: 'male', bloodGroup: 'B+', address: '789 Pine Rd, City', emergencyContact: { name: 'Lisa Wilson', phone: '9876543297', relation: 'Wife' } },
    ]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Appointment.create([
      { patient: patients[0]._id, doctor: doctors[0]._id, date: tomorrow, time: '10:00', reason: 'Cardiac checkup', status: 'scheduled' },
      { patient: patients[1]._id, doctor: doctors[2]._id, date: nextWeek, time: '14:30', reason: 'Pediatric consultation', status: 'scheduled' },
      { patient: patients[2]._id, doctor: doctors[1]._id, date: tomorrow, time: '11:00', reason: 'Headache evaluation', status: 'scheduled' },
    ]);

    const beds = [];
    for (let i = 1; i <= 5; i++) {
      beds.push({ bedNumber: `ICU-${String(i).padStart(2, '0')}`, category: 'ICU', ward: 'ICU Ward A', status: i <= 2 ? 'occupied' : 'available', patient: i <= 2 ? patients[i - 1]._id : null, occupiedAt: i <= 2 ? new Date() : null });
    }
    for (let i = 1; i <= 8; i++) {
      beds.push({ bedNumber: `GEN-${String(i).padStart(2, '0')}`, category: 'General', ward: 'General Ward B', status: i <= 3 ? 'occupied' : 'available', patient: i <= 3 ? patients[(i - 1) % 3]._id : null, occupiedAt: i <= 3 ? new Date() : null });
    }
    for (let i = 1; i <= 4; i++) {
      beds.push({ bedNumber: `EMG-${String(i).padStart(2, '0')}`, category: 'Emergency', ward: 'Emergency Ward', status: i === 1 ? 'occupied' : 'available', patient: i === 1 ? patients[0]._id : null, occupiedAt: i === 1 ? new Date() : null });
    }
    await Bed.create(beds);

    await Prescription.create({
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      diagnosis: 'Hypertension - Stage 1',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning with water' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after breakfast' },
      ],
      notes: 'Follow up in 4 weeks. Monitor blood pressure daily.',
      followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    });

    console.log('\n=== Sample Data Seeded Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Admin:   admin@hospital.com / admin123');
    console.log('Doctor:  sarah@hospital.com / doctor123');
    console.log('Patient: john@patient.com / patient123');
    console.log(`\nCreated: ${doctors.length} doctors, ${patients.length} patients, 3 appointments, ${beds.length} beds, 1 prescription`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
