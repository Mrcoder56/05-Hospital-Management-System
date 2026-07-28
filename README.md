# 🏥 MediCore — Hospital Management System

A full-stack Hospital Management System built with **React.js**, **Node.js/Express**, and **MongoDB**.

---

## 📁 Folder Structure

```
hospital-management/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── billingController.js
│   │   ├── medicalRecordController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Invoice.js
│   │   └── MedicalRecord.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── billing.js
│   │   ├── medicalRecords.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── seeder.js              # Seed demo data
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx     # Sidebar + topbar
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── PatientForm.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── DoctorForm.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── AppointmentForm.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── InvoiceForm.jsx
│   │   │   ├── MedicalRecords.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone or download the project

```bash
cd hospital-management
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=30d
NODE_ENV=development
```

Seed the database with demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev    # Development (with nodemon)
# or
npm start      # Production
```

Backend runs on: http://localhost:5000

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env.local` (optional — by default proxies to localhost:5000):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on: http://localhost:3000

---

## 🔐 Demo Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | sarah@hospital.com | doctor123 |
| Doctor | michael@hospital.com | doctor123 |
| Receptionist | reception@hospital.com | reception123 |

---

## 🔒 Role-Based Access Control

| Feature | Admin | Doctor | Receptionist |
|---------|-------|--------|--------------|
| Dashboard | ✅ | ✅ | ✅ |
| Patients (view/add/edit) | ✅ | ✅ | ✅ |
| Patients (delete) | ✅ | ❌ | ✅ |
| Doctors (view) | ✅ | ✅ | ✅ |
| Doctors (add/edit/delete) | ✅ | ❌ | ❌ |
| Appointments | ✅ | ✅ (own) | ✅ |
| Billing | ✅ | ❌ | ✅ |
| Medical Records | ✅ | ✅ | ❌ |
| Reports | ✅ | ❌ | ❌ |
| Register users | ✅ | ❌ | ❌ |

---

## 📡 REST API Reference

### Authentication

```
POST /api/auth/login           — Login (public)
POST /api/auth/register        — Register user (Admin only)
GET  /api/auth/me              — Get current user
PUT  /api/auth/password        — Change password
GET  /api/auth/users           — List all users (Admin only)
```

### Patients

```
GET    /api/patients           — List patients (paginated, searchable)
GET    /api/patients/:id       — Get patient by ID
POST   /api/patients           — Create patient
PUT    /api/patients/:id       — Update patient
DELETE /api/patients/:id       — Deactivate patient
```

Query params for GET /api/patients:
- `page` — page number (default 1)
- `limit` — items per page (default 10)
- `search` — search by name, ID, phone

### Doctors

```
GET    /api/doctors            — List doctors
GET    /api/doctors/:id        — Get doctor
POST   /api/doctors            — Create doctor (Admin)
PUT    /api/doctors/:id        — Update doctor (Admin)
DELETE /api/doctors/:id        — Deactivate doctor (Admin)
```

### Appointments

```
GET    /api/appointments       — List appointments
GET    /api/appointments/today — Today's appointments
GET    /api/appointments/:id   — Get appointment
POST   /api/appointments       — Book appointment
PUT    /api/appointments/:id   — Update appointment
DELETE /api/appointments/:id   — Delete appointment
```

Query params:
- `status` — filter by status
- `date` — filter by date (YYYY-MM-DD)
- `doctorId` / `patientId` — filter by doctor or patient

### Billing

```
GET    /api/billing                    — List invoices
GET    /api/billing/revenue-summary    — Revenue by payment status
GET    /api/billing/:id                — Get invoice
POST   /api/billing                    — Create invoice
PUT    /api/billing/:id                — Update invoice
DELETE /api/billing/:id                — Delete invoice (Admin)
```

### Medical Records

```
GET    /api/medical-records    — List records
GET    /api/medical-records/:id — Get record
POST   /api/medical-records    — Create record
PUT    /api/medical-records/:id — Update record
DELETE /api/medical-records/:id — Delete record
```

### Dashboard

```
GET /api/dashboard/stats       — Aggregated stats, charts data
```

---

## 📬 Sample API Requests (Postman)

### Login
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@hospital.com",
    "role": "admin"
  }
}
```

### Create Patient
```json
POST http://localhost:5000/api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "James",
  "lastName": "Wilson",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "bloodGroup": "B+",
  "phone": "+1-555-9999",
  "email": "james.wilson@email.com",
  "address": {
    "street": "456 Oak Ave",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77001"
  },
  "emergencyContact": {
    "name": "Mary Wilson",
    "relationship": "Spouse",
    "phone": "+1-555-8888"
  },
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC-123456"
}
```

### Book Appointment
```json
POST http://localhost:5000/api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "<patient_id>",
  "doctor": "<doctor_id>",
  "appointmentDate": "2026-03-15",
  "appointmentTime": "10:00",
  "type": "consultation",
  "symptoms": "Chest pain and shortness of breath"
}
```

### Create Invoice
```json
POST http://localhost:5000/api/billing
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "<patient_id>",
  "items": [
    { "description": "Consultation Fee", "quantity": 1, "unitPrice": 150 },
    { "description": "ECG Test", "quantity": 1, "unitPrice": 80 },
    { "description": "Blood Panel", "quantity": 1, "unitPrice": 120 }
  ],
  "tax": 35,
  "discount": 0,
  "paidAmount": 0,
  "paymentStatus": "pending",
  "paymentMethod": "insurance",
  "dueDate": "2026-04-01"
}
```

### Create Medical Record
```json
POST http://localhost:5000/api/medical-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "<patient_id>",
  "doctor": "<doctor_id>",
  "visitDate": "2026-03-02",
  "chiefComplaint": "Recurring chest pain for 3 days",
  "diagnosis": [
    { "condition": "Angina Pectoris", "icdCode": "I20.9", "severity": "moderate" }
  ],
  "symptoms": ["chest pain", "shortness of breath", "fatigue"],
  "vitalSigns": {
    "bloodPressure": "145/90",
    "heartRate": 88,
    "temperature": 98.6,
    "weight": 82,
    "height": 175,
    "oxygenSaturation": 97
  },
  "prescriptions": [
    {
      "medication": "Nitroglycerin",
      "dosage": "0.4mg",
      "frequency": "As needed",
      "duration": "30 days",
      "instructions": "Place under tongue when chest pain occurs"
    }
  ],
  "notes": "Patient advised to reduce sodium intake and begin cardiac rehabilitation.",
  "followUpDate": "2026-03-16"
}
```

---

## 🏗 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- React Hook Form
- React Hot Toast
- Recharts
- Heroicons
- date-fns
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator
- Morgan (logging)
- CORS

---

## 🔒 Security Features

- JWT token authentication
- Role-based route protection
- Bcrypt password hashing (12 rounds)
- CORS enabled
- Error handling middleware
- Inactive user blocking

---

## 📈 Database Schema Summary

| Model | Key Fields |
|-------|-----------|
| User | name, email, password (hashed), role, isActive |
| Patient | patientId (auto), firstName, lastName, DOB, gender, bloodGroup, phone, address, insurance |
| Doctor | doctorId (auto), user ref, specialization, department, experience, consultationFee, availability |
| Appointment | appointmentId (auto), patient ref, doctor ref, date, time, type, status |
| Invoice | invoiceId (auto), patient ref, items[], subtotal, tax, discount, totalAmount, paidAmount, balance |
| MedicalRecord | recordId (auto), patient ref, doctor ref, diagnosis[], vitalSigns, prescriptions[], labTests[] |
