# API Documentation — Smart Hospital Resource Management System

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

---

## Authentication

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "9876543210"
}
```

**Response:** `{ success, data: { user, token } }`

---

### POST `/auth/login`
**Body:** `{ "email": "...", "password": "..." }`

**Response:** `{ success, data: { user, token } }`

---

### GET `/auth/me` 🔒
Get current user and linked profile (patient/doctor).

---

### GET `/auth/users` 🔒 Admin
List all users.

---

## Patients

### GET `/patients` 🔒 Admin, Doctor
**Query:** `?search=john`

### GET `/patients/:id` 🔒 Admin, Doctor, Patient

### POST `/patients` 🔒 Admin
**Body:**
```json
{
  "name": "John Smith",
  "email": "john@patient.com",
  "phone": "9876543210",
  "dateOfBirth": "1985-03-15",
  "gender": "male",
  "bloodGroup": "O+",
  "address": "123 Main St"
}
```

### PUT `/patients/:id` 🔒 Admin

### DELETE `/patients/:id` 🔒 Admin

### POST `/patients/:id/medical-history` 🔒 Admin, Doctor
**Body:**
```json
{
  "condition": "Hypertension",
  "diagnosis": "Stage 1",
  "treatment": "Lisinopril 10mg",
  "notes": "Monitor weekly"
}
```

### DELETE `/patients/:id/medical-history/:historyId` 🔒 Admin, Doctor

---

## Doctors

### GET `/doctors`
**Query:** `?department=Cardiology&availability=available&search=sarah`

### GET `/doctors/:id`

### POST `/doctors` 🔒 Admin
**Body:**
```json
{
  "name": "Dr. Sarah Johnson",
  "email": "sarah@hospital.com",
  "phone": "9876543211",
  "specialization": "Cardiologist",
  "department": "Cardiology",
  "availability": "available",
  "experience": 12,
  "qualification": "MD, FACC"
}
```

### PUT `/doctors/:id` 🔒 Admin

### DELETE `/doctors/:id` 🔒 Admin

### PATCH `/doctors/:id/availability` 🔒 Admin, Doctor
**Body:** `{ "availability": "on_leave" }`

---

## Appointments

### GET `/appointments` 🔒
**Query:** `?status=scheduled&doctor=<id>&patient=<id>&date=2025-06-23`

### GET `/appointments/:id` 🔒

### POST `/appointments` 🔒 Admin, Patient
**Body:**
```json
{
  "patient": "<patientId>",
  "doctor": "<doctorId>",
  "date": "2025-06-25",
  "time": "10:00",
  "reason": "Regular checkup",
  "notes": "Optional notes"
}
```
Sends confirmation email on success.

### PUT `/appointments/:id/cancel` 🔒
Sends cancellation email.

### PUT `/appointments/:id/reschedule` 🔒
**Body:** `{ "date": "2025-06-26", "time": "14:00" }`

### PUT `/appointments/:id/complete` 🔒 Admin, Doctor

### POST `/appointments/:id/reminder` 🔒 Admin, Doctor
Send reminder email.

### GET `/appointments/doctor/:doctorId/dashboard` 🔒 Admin, Doctor
Returns today's schedule, upcoming appointments, and stats.

---

## Beds

### GET `/beds` 🔒
**Query:** `?category=ICU&status=available`

### GET `/beds/stats` 🔒
Bed occupancy statistics by category.

### GET `/beds/:id` 🔒

### POST `/beds` 🔒 Admin
**Body:**
```json
{
  "bedNumber": "ICU-06",
  "category": "ICU",
  "ward": "ICU Ward A"
}
```
Emits Socket.IO `bedUpdate` event.

### PUT `/beds/:id` 🔒 Admin

### DELETE `/beds/:id` 🔒 Admin

### PUT `/beds/:id/assign` 🔒 Admin
**Body:** `{ "patientId": "<patientId>" }`

### PUT `/beds/:id/release` 🔒 Admin

---

## Analytics

### GET `/analytics/dashboard` 🔒 Admin, Doctor
Returns totals for patients, doctors, appointments, prescriptions, and bed stats.

### GET `/analytics/monthly` 🔒 Admin, Doctor
**Query:** `?year=2025`

Returns monthly appointment, patient, and prescription counts.

### GET `/analytics/departments` 🔒 Admin, Doctor
Doctor and appointment counts by department.

---

## Prescriptions

### GET `/prescriptions` 🔒
**Query:** `?patient=<id>&doctor=<id>`

### GET `/prescriptions/:id` 🔒

### GET `/prescriptions/patient/:patientId` 🔒
Patient prescription history.

### POST `/prescriptions` 🔒 Admin, Doctor
**Body:**
```json
{
  "patient": "<patientId>",
  "doctor": "<doctorId>",
  "diagnosis": "Hypertension Stage 1",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take with water"
    }
  ],
  "notes": "Follow up in 4 weeks",
  "followUpDate": "2025-07-23"
}
```

### DELETE `/prescriptions/:id` 🔒 Admin, Doctor

---

## Health Check

### GET `/health`
**Response:** `{ success: true, message: "Smart Hospital API is running" }`

---

## Socket.IO Events

**Connect to:** `http://localhost:5000`

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinBedDashboard` | Client → Server | Join bed updates room |
| `bedUpdate` | Server → Client | `{ bed, action }` on create/update/delete/assign/release |

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error / bad request |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / insufficient role |
| 404 | Resource not found |
| 500 | Server error |
