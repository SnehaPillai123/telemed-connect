# 🏥 MediConnect — Telemedicine Web Application

A full-stack telemedicine platform built with **React** and **Firebase**, enabling patients to consult doctors online through a secure, responsive, and feature-rich interface.

🔗 **Live Demo:** [https://telemed-connect-6e817.web.app/](https://telemed-connect-6e817.web.app/)

---

## 👥 Team & Contributions

| Member | Role | Key Work |
|---|---|---|
| Sneha | Frontend Lead | React architecture, Context API, routing |
| Amit | Backend | Firebase setup, Firestore collections, Book Appointment |
| Mudassir | UI/UX | Responsive design, CSS animations |
| Ritesh | Special Features | Emergency SOS, Multilingual Chat, Ask Before You Book |

---

## 🚀 Features

### Core Features
- 🔐 **User Authentication** — Email/password login via Firebase Auth with role-based access (Patient / Doctor)
- 📅 **Book Appointment** — Patients can schedule appointments with doctors; stored in Firestore with status tracking
- 💊 **Prescriptions** — Doctors can issue and manage prescriptions per patient
- 💬 **Real-time Chat** — Live messaging between patient and doctor

### ✨ Unique Special Features
1. **🆘 Emergency SOS** — Hold the red button for 3 seconds to trigger an emergency alert. Uses the browser's `navigator.geolocation` API to capture GPS coordinates and begins a 5-second countdown before dispatching the alert.

2. **🌐 Multilingual Chat** — Real-time message translation using the MyMemory API with `fetch()` and `async/await`, allowing patients and doctors to communicate across language barriers.

3. **❓ Ask Before You Book** — A 5-question smart algorithm that scores user responses and recommends one of three outcomes: *Self-Care*, *Consultation*, or *Urgent Care* — helping users decide if they actually need an appointment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Components, useState, useEffect, Context API) |
| Backend / Database | Firebase (Firestore NoSQL) |
| Authentication | Firebase Auth |
| Hosting | Firebase Hosting (HTTPS with free SSL) |
| Translation API | MyMemory API |
| Geolocation | Browser Navigator Geolocation API |

---

## 🗄️ Firestore Database Structure

6 collections in Firestore:

```
firestore/
├── users/
├── doctors/
├── patients/
├── appointments/    ← { patientId, doctorId, date, time, reason, status: "pending" }
├── prescriptions/
└── chats/
```

---

## 📱 Responsive Design

CSS media queries with 3 breakpoints:

| Breakpoint | Screen | Layout |
|---|---|---|
| `< 600px` | Mobile / Phone | Sidebar hidden, single column grid |
| `600px – 991px` | Tablet | 2-column grid |
| `≥ 992px` | Desktop | Full layout, sidebar always visible |

Animations powered by CSS `@keyframes` — the `fadeUp` animation makes cards appear smoothly on page load.

---

## 🔒 Security

- **Authentication** — Firebase Auth verifies user identity on login
- **Authorization** — `PrivateRoute` component checks user role; patients cannot access doctor pages
- **HTTPS** — Firebase Hosting provides automatic SSL/TLS encryption, essential for protecting sensitive medical data

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https://github.com/SnehaPillai123/telemed-connect.git
cd telemed-connect

# Install dependencies
npm install

# Start development server
npm start
```

> Firebase config keys are stored in `.env` — contact the team for access.

---

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-level pages (Dashboard, Appointments, Chat...)
├── context/          # React Context API — global user & role state
├── firebase/         # Firebase config and utility functions
└── styles/           # CSS with media queries and keyframe animations
```

---

## 🎓 Academic Project

Built as part of our college curriculum to demonstrate full-stack development skills using modern web technologies.

**Group of 4 | Presentation: [Your Date]**
