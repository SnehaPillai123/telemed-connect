# TeleMed Connect 🏥

> **Smart Telemedicine Platform** — Connecting patients with verified doctors for remote consultations across India.

[![Live Demo](https://img.shields.io/badge/Live-Demo-teal?style=for-the-badge)](https://telemed-connect-6e817.web.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-Build-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [APIs & Integrations](#apis--integrations)
- [Database Schema](#database-schema)
- [Team](#team)

---

## Overview

India has 140 crore people but only 12 lakh registered doctors — with **80% of doctors concentrated in cities** while 70% of the population lives in rural areas. Existing telemedicine platforms are complex, expensive, and ignore this gap.

**TeleMed Connect** is a full-stack telemedicine web application that bridges this divide through:

- AI-powered symptom analysis before booking
- Multilingual doctor-patient communication (Hindi, Marathi, Tamil, Telugu)
- Emergency SOS with real-time GPS location sharing
- Integrated video consultations, digital prescriptions, and secure payments

🔗 **Live:** [https://telemed-connect-6e817.web.app](https://telemed-connect-6e817.web.app)  
📁 **GitHub:** [SnehaPillai123/telemed-connect](https://github.com/SnehaPillai123/telemed-connect)

---

## Features

### 🌟 Unique Features

| Feature | Description |
|---|---|
| **Ask Before You Book** | 5-question scoring algorithm tells patients if they actually need a doctor before booking — no other platform does this |
| **Emergency SOS with GPS** | Hold-to-activate 3-second button captures GPS coordinates and displays helplines 112 / 108 / 104 |
| **Multilingual Chat** | Real-time translation in Hindi, Marathi, Tamil, and Telugu — removes the biggest barrier in rural Indian healthcare |

### 📦 Full Feature List

- **AI Symptom Checker** — Gemini API with probability scores, home remedies, diet tips, and OTC medicine suggestions; falls back to a built-in SMART_DB covering 8 medical categories
- **Video Consultations** — Jitsi Meet embedded via appointment ID; no API key required
- **Digital Prescriptions** — Branded A4 PDF generation with jsPDF; includes medicine dosage and direct 1mg / PharmEasy order links
- **Razorpay Payments** — UPI, cards, and NetBanking support for consultation fee collection
- **Lab Report Upload** — Firebase Storage drag-and-drop with upload progress tracking
- **Doctor Reviews & Ratings** — 5-star system with distribution chart; one review per patient enforced
- **Appointment Calendar** — Monthly calendar with colored appointment indicators
- **Health Analytics Dashboard** — Visual stats for visits, prescriptions, weight, glucose, and BP
- **Admin Panel** — Doctor approval/suspension, platform-wide appointment overview
- **Role-Based Access** — Separate patient, doctor, and admin portals with `PrivateRoute` protection

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Component-based UI with instant Hot Module Replacement |
| Language | JavaScript ES6+ | async/await, destructuring, template literals |
| Styling | CSS3 — Flexbox, Grid, Animations | 3 responsive breakpoints, `@keyframes`, CSS variables |
| Routing | React Router DOM | 20+ pages with client-side navigation |
| Auth | Firebase Authentication | Email/password login, JWT sessions, role-based redirect |
| Database | Cloud Firestore (NoSQL) | Real-time updates across 8 collections |
| File Storage | Firebase Storage | Lab report upload with progress tracking |
| Hosting | Firebase Hosting | One-command deploy, HTTPS/SSL, global CDN |
| Payments | Razorpay SDK | Indian payment gateway — UPI, cards, NetBanking |
| Video | Jitsi Meet | Free open-source video; shared room via appointment ID |
| PDF | jsPDF (CDN) | Browser-based branded prescription PDF generation |
| Notifications | react-hot-toast | Success and error toast alerts |
| AI/ML | Gemini API + SMART_DB fallback | Symptom analysis with probability scores |
| Version Control | Git + GitHub | 30+ commits tracking weekly progress |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project with Auth, Firestore, Storage, and Hosting enabled
- A Razorpay account (test mode is fine)
- A Gemini API key (optional — SMART_DB fallback works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/SnehaPillai123/telemed-connect.git
cd telemed-connect

# Install dependencies
npm install

# Add your environment variables (see below)
cp .env.example .env

# Start the development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file to GitHub.**

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Gemini AI (optional — SMART_DB fallback is built-in)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Test Credentials (Razorpay)

| Method | Details |
|---|---|
| Card | `4111 1111 1111 1111` |
| UPI | `success@razorpay` |

---

## Project Structure

```
src/
├── firebase/
│   └── config.js              # Firebase initialization
├── context/
│   └── AuthContext.jsx        # Global auth state via Context API
├── components/
│   ├── Layout.jsx             # Shared sidebar, top bar, all CSS & animations
│   └── PaymentGateway.jsx     # Razorpay integration
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PatientDashboard.jsx
│   ├── DoctorDashboard.jsx
│   ├── BookAppointment.jsx    # Form validation + payment flow
│   ├── HealthCenter.jsx       # AI Symptom Checker + Ask Before You Book
│   ├── Chat.jsx               # Real-time multilingual chat
│   ├── HospitalsEmergency.jsx # Emergency SOS + GPS
│   ├── VideoCall.jsx          # Jitsi Meet integration
│   ├── PDFPrescription.jsx    # jsPDF branded prescription
│   ├── LabReports.jsx         # Firebase Storage upload
│   ├── DoctorReviews.jsx
│   ├── AppointmentCalendar.jsx
│   ├── HealthAnalytics.jsx
│   └── AdminPanel.jsx
└── App.jsx                    # All routes + PrivateRoute + RoleRedirect
```

---

## APIs & Integrations

| API | File | Key Required |
|---|---|---|
| Firebase Auth | `AuthContext.jsx`, `Login.jsx`, `Register.jsx` | Yes (Firebase project key) |
| Cloud Firestore | All data pages | Yes (same Firebase key) |
| Firebase Storage | `LabReports.jsx` | Yes (same Firebase key) |
| Razorpay | `PaymentGateway.jsx` | Yes — `VITE_RAZORPAY_KEY_ID` |
| MyMemory Translation | `Chat.jsx` | No — free public API |
| Jitsi Meet | `VideoCall.jsx` | No — open source |
| jsPDF | `PDFPrescription.jsx` | No — loaded from CDN |
| Browser Geolocation | `HospitalsEmergency.jsx` | No — native browser API |
| Gemini API | `HealthCenter.jsx` | Optional — SMART_DB fallback built-in |

---

## Database Schema

| Collection | Document ID | Key Fields |
|---|---|---|
| `users` | Firebase Auth UID | `email`, `role`, `displayName`, `createdAt` |
| `patients` | Firebase Auth UID | `fullName`, `phone`, `bloodGroup`, `allergies`, `medicalHistory` |
| `doctors` | Firebase Auth UID | `fullName`, `specialization`, `licenseNumber`, `consultationFee`, `rating`, `approved` |
| `appointments` | Auto ID | `patientId`, `doctorId`, `appointmentDate`, `appointmentTime`, `status`, `paymentId` |
| `prescriptions` | Auto ID | `patientId`, `doctorId`, `diagnosis`, `medicines[{name, dosage, frequency, duration}]` |
| `chats` | chatId/messages/msgId | `senderId`, `originalText`, `translatedText`, `originalLanguage`, `timestamp` |
| `reviews` | Auto ID | `doctorId`, `patientId`, `rating`, `comment`, `createdAt` |
| `labReports` | Auto ID | `patientId`, `reportName`, `reportType`, `fileURL`, `fileSize` |

---

## Web Programming Experiments Covered

| Experiment | Concept | Implementation |
|---|---|---|
| 1 | Semantic HTML | `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`, `<time>` used across all pages |
| 2 | CSS Flexbox + Grid | Sidebar (`flex`), dashboard stat cards (`grid`), CSS variables, `:hover` / `:focus` states |
| 3 | Responsive Design + Animations | 3 `@media` breakpoints; `@keyframes` fadeUp, pulse, spin; `prefers-reduced-motion` support |
| 4 | Form Validation | `validateDate()`, `validateTime()`, `validateReason()` — real-time `onChange` + submit-time checks |
| 5 | Fetch API + JSON | MyMemory translation API — `fetch()` → `response.json()` → `data.responseData.translatedText` |
| 6 | Async/Await + REST API | All Firebase calls wrapped in `async/await` with `try/catch` |

---

## Team

Built by **Team TeleMed Connect** — Pillai College of Engineering, New Panvel  
Subject: Web Programming (ENGG201) | A.Y. 2025–26  
Under the guidance of **Prof. Nishant Shankar**

| Member | Role |
|---|---|
| **Sneha Pillai** | Team Lead & Frontend Architecture — App.jsx, Layout, Dashboards, Routing, Deployment |
| **Amit Pundekar** | Backend & Firebase — Auth, Firestore Schema, Appointments, Prescriptions |
| **Mudassir Shaikh** | UI/UX & Responsive Design — CSS Animations, Sidebar, Accessibility |
| **Ritesh Singh** | Special Features & Testing — Emergency SOS, Chat, PDF, Lab Reports, Reviews |

---

*TeleMed Connect — Bridging the healthcare access gap between urban and rural India.*
