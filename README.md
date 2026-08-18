# Smart Hospital Resource Management System

A full-stack MERN application for managing hospital resources including patients, doctors, appointments, beds, prescriptions, and analytics with real-time updates.

## Features

- JWT Authentication with role-based access control (Admin, Doctor, Patient)
- Patient Management - CRUD, search, medical history
- Doctor Management - CRUD, department assignment, availability status
- Appointment Management - book, cancel, reschedule, doctor dashboard
- Real-Time Bed Management - ICU/General/Emergency with Socket.IO live updates
- Analytics Dashboard - Chart.js charts, monthly reports, occupancy stats
- PDF Prescriptions - create, download via jsPDF, prescription history
- Email Notifications - confirmation, reminder, cancellation via Nodemailer

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Bootstrap 5, Chart.js, jsPDF |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Real-Time | Socket.IO |
| Email | Nodemailer |

## Installation

1. Install dependencies in both backend and frontend folders using npm install
2. Copy .env.example to .env in both folders and fill in your own values
3. Seed sample data with npm run seed inside backend
4. Run npm run dev in backend, and npm run dev in frontend, in separate terminals

Frontend runs at http://localhost:5173
Backend API runs at http://localhost:5000/api

## Role Permissions

| Feature | Admin | Doctor | Patient |
|---------|-------|--------|---------|
| Dashboard | Yes | Yes | Yes |
| Manage Patients | Full CRUD | View + History | No |
| Manage Doctors | Full CRUD | No | No |
| Appointments | All | Own schedule | Own |
| Book Appointment | No | No | Yes |
| Bed Management | Full | View | View |
| Prescriptions | Create | Create | View own |
| Analytics | Yes | Yes | No |

## API Documentation

See API_DOCUMENTATION.md for the complete endpoint reference.

## Production Build

Run npm run build in frontend, and npm start in backend.
Serve the frontend/dist folder with any static host and point CLIENT_URL to your frontend URL.

## License

MIT
