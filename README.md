# Smart Hospital Resource Management System

A full-stack MERN application for managing hospital resources including patients, doctors, appointments, beds, prescriptions, and analytics with real-time updates.

## Features

- **JWT Authentication** with role-based access control (Admin, Doctor, Patient)
- **Patient Management** — CRUD, search, medical history
- **Doctor Management** — CRUD, department assignment, availability status
- **Appointment Management** — book, cancel, reschedule, doctor dashboard
- **Real-Time Bed Management** — ICU/General/Emergency with Socket.IO live updates
- **Analytics Dashboard** — Chart.js charts, monthly reports, occupancy stats
- **PDF Prescriptions** — create, download via jsPDF, prescription history
- **Email Notifications** — confirmation, reminder, cancellation via Nodemailer

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Bootstrap 5, Chart.js, jsPDF |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Real-Time | Socket.IO |
| Email | Nodemailer |

## Project Structure

```
project1/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── seed/            # Sample data seeder
│   ├── utils/           # Token, email, validators
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API & Socket clients
│   │   └── utils/       # PDF generation
│   └── index.html
├── API_DOCUMENTATION.md
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password (for email notifications)

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-hospital
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Smart Hospital <your_email@gmail.com>
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed sample data

```bash
cd backend
npm run seed
```

### 4. Start the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Sample Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | sarah@hospital.com | doctor123 |
| Patient | john@patient.com | patient123 |

## Role Permissions

| Feature | Admin | Doctor | Patient |
|---------|-------|--------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Manage Patients | ✅ CRUD | ✅ View + History | ❌ |
| Manage Doctors | ✅ CRUD | ❌ | ❌ |
| Appointments | ✅ All | ✅ Own schedule | ✅ Own |
| Book Appointment | ❌ | ❌ | ✅ |
| Bed Management | ✅ Full | ✅ View | ✅ View |
| Prescriptions | ✅ Create | ✅ Create | ✅ View own |
| Analytics | ✅ | ✅ | ❌ |

## MongoDB Schema Design

### User
- `name`, `email`, `password` (hashed), `role` (admin/doctor/patient), `phone`, `isActive`

### Patient
- `user` (ref), `name`, `email`, `phone`, `dateOfBirth`, `gender`, `bloodGroup`, `address`, `emergencyContact`, `medicalHistory[]`

### Doctor
- `user` (ref), `name`, `email`, `phone`, `specialization`, `department`, `availability`, `experience`, `qualification`

### Appointment
- `patient` (ref), `doctor` (ref), `date`, `time`, `reason`, `status`, `notes`, `previousDate`, `previousTime`

### Bed
- `bedNumber`, `category` (ICU/General/Emergency), `ward`, `status`, `patient` (ref), `occupiedAt`

### Prescription
- `patient` (ref), `doctor` (ref), `appointment` (ref), `diagnosis`, `medications[]`, `notes`, `followUpDate`

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference.

## Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the app password as `EMAIL_PASS` in `.env`

Without email credentials, the app logs emails to the console in development mode.

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

Serve the `frontend/dist` folder with any static host and point `CLIENT_URL` to your frontend URL.

## License

MIT
