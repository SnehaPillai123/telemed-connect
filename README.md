<div align="center">

<img src="https://img.shields.io/badge/TeleMed-Connect-0d9488?style=for-the-badge&logo=react&logoColor=white" alt="TeleMed Connect"/>

# TeleMed Connect 🏥
### Smart Telemedicine Platform

**Connecting patients with verified doctors — anytime, anywhere in India**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-telemed--connect--6e817.web.app-0d9488?style=for-the-badge)](https://telemed-connect-6e817.web.app)
[![GitHub](https://img.shields.io/badge/GitHub-SnehaPillai123-181717?style=for-the-badge&logo=github)](https://github.com/SnehaPillai123/telemed-connect)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

---

**Course:** ENGG201 — Web Programming Mini Project  
**College:** Pillai College of Engineering  
**Academic Year:** 2025–26  
**Team:** Sneha Pillai · Amit · Mudassir · Ritesh

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [3 Unique Features](#-3-unique-features)
- [Project Structure](#-project-structure)
- [Experiments Covered](#-experiments-covered)
- [Team Contributions](#-team-contributions)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Git Commits](#-git-commits)

---

## 🎯 Problem Statement

India has **140 crore people** but only **12 lakh registered doctors** — 1 doctor per 1,000 people. **80% of doctors** are in cities while **70% of people** live in rural areas. Existing apps like Apollo247 and Practo are complex, expensive, and inaccessible to rural populations.

---

## 💡 Our Solution

**TeleMed Connect** is a full-stack telemedicine web application that connects patients with verified doctors for remote consultations. It provides:

- 🤖 AI-powered symptom analysis
- 💊 Digital prescriptions with PDF download
- 🌐 Multilingual real-time chat (5 Indian languages)
- 🆘 Emergency SOS with GPS location sharing
- 💳 Online consultation fee payment via Razorpay
- 📹 Live video consultation via Jitsi Meet
- 🛡️ Admin panel for doctor approval and management

---

## 🌐 Live Demo

| Link | Description |
|------|-------------|
| 🌐 [telemed-connect-6e817.web.app](https://telemed-connect-6e817.web.app) | Live production app |
| 🔑 Patient Login | snehahp10@gmail.com |
| 🔑 Doctor Login | gdsj@gmail.com (General Physician, ₹500 fee) |

> **Test Razorpay Payment:** Card `4111 1111 1111 1111` · Expiry `12/26` · CVV `123` · OTP `1234`

---

## 🛠 Tech Stack

| Technology | Purpose | Why We Used It |
|---|---|---|
| **React + Vite** | UI components, fast dev | Component reuse across 20+ pages. Vite starts in <1 second |
| **JavaScript ES6+** | All logic, API calls | async/await for Firebase, modern syntax |
| **CSS3 — Flexbox, Grid** | Layout, responsive design | Grid for dashboards, Flexbox for sidebar, @keyframes animations |
| **React Router DOM** | Navigate between 20+ pages | Instant navigation without page reload |
| **Firebase Auth** | Secure login / register | Handles JWT tokens, sessions, password hashing |
| **Cloud Firestore** | NoSQL database | Real-time updates, flexible medical data schema |
| **Firebase Hosting** | Live deployment with HTTPS | One command deploy, free SSL, global CDN |
| **Firebase Storage** | Lab report file uploads | Handles large file uploads with progress tracking |
| **MyMemory API** | Real-time chat translation | Free API, 5 Indian languages, simple fetch() call |
| **Razorpay** | Online consultation payment | Indian gateway — UPI, Cards, NetBanking |
| **Jitsi Meet** | Video consultation | Free, open-source, no API key needed |
| **OpenRouter AI (Llama)** | AI symptom analysis | Free API, multiple AI models, no rate limits |
| **jsPDF** | PDF prescription generation | Browser-based, no server needed, branded design |
| **react-hot-toast** | Notifications | Lightweight toast alerts |
| **Git + GitHub** | Version control | 30+ commits tracking weekly progress |

---

## ✨ Features

### Patient Features
| Feature | File | Description |
|---|---|---|
| 🏠 Landing Page | `Landing.jsx` | Hero section, animated stats counter, features grid, specializations |
| 🔐 Login & Register | `Login.jsx`, `Register.jsx` | Email/password auth, role selection, dashboard redirect |
| 📊 Patient Dashboard | `PatientDashboard.jsx` | Real Firestore stats — upcoming, completed appointments |
| 🔍 Find Doctors | `SearchDoctors.jsx` | Filter by specialization, experience, fee |
| 📅 Book Appointment | `BookAppointment.jsx` | 14 time slots, form validation, Razorpay payment |
| 📋 My Appointments | `PatientAppointments.jsx` | Filter tabs, health records timeline |
| 💊 My Prescriptions | `MyPrescriptions.jsx` | View prescriptions, weekly medication tracker |
| 📄 PDF Prescription | `PDFPrescription.jsx` | Branded PDF download with jsPDF |
| 🤖 AI Symptom Checker | `HealthCenter.jsx` | OpenRouter Llama AI analysis, home remedies, diet tips |
| 💬 Multilingual Chat | `Chat.jsx` | Real-time Firestore chat, MyMemory translation |
| 🆘 Emergency SOS | `HospitalsEmergency.jsx` | 3-second hold activation, GPS coordinates |
| 📤 Lab Reports | `LabReports.jsx` | Drag-drop upload to Firebase Storage |
| ⭐ Doctor Reviews | `DoctorReviews.jsx` | 5-star rating, written reviews, rating chart |
| 📹 Video Call | `VideoCall.jsx` | Jitsi Meet in-app video consultation |
| 📆 Appointment Calendar | `AppointmentCalendar.jsx` | Visual monthly calendar with colored dots |
| 📈 Health Analytics | `HealthAnalytics.jsx` | Charts for weight, glucose, BP trends |

### Doctor Features
| Feature | Description |
|---|---|
| 🏥 Doctor Dashboard | Today's appointments count, pending/completed stats |
| ✅ Manage Appointments | Confirm, Decline, Complete workflow |
| 💊 Write Prescription | Dynamic medicines, dosage, frequency, 1mg/PharmEasy links |
| 💬 Chat with Patient | Real-time messaging |
| 📹 Video Consultation | Join same Jitsi room as patient |

### Admin Features
| Feature | Description |
|---|---|
| 🛡️ Admin Panel | Approve/suspend doctors, manage all users |

---

## 🌟 3 Unique Features

### 1. 🤔 Ask Before You Book
A 5-question smart scoring algorithm that tells patients **if they actually need a doctor** before booking. No other telemedicine app does this — they all just push you to book.

**How it works:** Asks about symptoms, duration, severity, home remedies tried, and urgency. Calculates a score. Shows: "Self-Care at Home", "Schedule Appointment", or "Seek Immediate Care".

### 2. 🆘 Emergency SOS with GPS
Hold-to-activate 3-second button that captures real GPS coordinates and instantly displays emergency helplines (112 / 108 / 104) with the patient's exact location.

**Technical implementation:**
```javascript
// Hold to activate — 3 seconds using setInterval
onMouseDown → setInterval increments holdProgress by 5% every 150ms
// At 100% → activateSOS() called
navigator.geolocation.getCurrentPosition() → captures GPS lat/lng
```

### 3. 🌐 Multilingual Chat
Real-time translation in Hindi, Marathi, Tamil, and Telugu using MyMemory Translation API. Removes the biggest barrier in rural Indian healthcare — language.

**Technical implementation:**
```javascript
const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${lang}`;
const response = await fetch(url);
const data = await response.json();
// Both original + translated text saved to Firestore
```

---

## 📁 Project Structure

```
telemed-connect/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Shared sidebar + top bar (all pages)
│   │   ├── PaymentGateway.jsx  # Razorpay component
│   │   ├── PrivateRoute.jsx    # Role-based route protection
│   │   └── NextStepBanner.jsx  # CTA banners
│   ├── context/
│   │   └── AuthContext.jsx     # Global user state with useContext
│   ├── firebase/
│   │   └── config.js           # Firebase init — Auth, Firestore, Storage
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx / Register.jsx
│   │   ├── PatientDashboard.jsx / DoctorDashboard.jsx
│   │   ├── SearchDoctors.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── PatientAppointments.jsx / DoctorAppointments.jsx
│   │   ├── Prescription.jsx / MyPrescriptions.jsx
│   │   ├── PDFPrescription.jsx
│   │   ├── HealthCenter.jsx     # AI Symptom Checker
│   │   ├── Chat.jsx             # Multilingual chat
│   │   ├── HospitalsEmergency.jsx  # Emergency SOS
│   │   ├── VideoCall.jsx        # Jitsi video
│   │   ├── LabReports.jsx
│   │   ├── DoctorReviews.jsx
│   │   ├── AppointmentCalendar.jsx
│   │   ├── HealthAnalytics.jsx
│   │   ├── AdminPanel.jsx
│   │   └── InsuranceCoverage.jsx
│   └── App.jsx                 # All routes defined here
├── .env                        # API keys (NOT in GitHub)
├── .gitignore
├── firebase.json
├── vite.config.js
└── package.json
```

---

## 🔬 Experiments Covered

| Experiment | Concept | Implementation in Project |
|---|---|---|
| **Exp 1** | Semantic HTML | `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`, `<time>` used on all pages |
| **Exp 2** | CSS Flexbox + Grid + Selectors | Sidebar (Flex), Dashboard cards (Grid), CSS Variables (`--color-primary`), `:hover`, `:focus` |
| **Exp 3** | Responsive Design + CSS Animations | 3 breakpoints: phone <600px, tablet 600–991px, desktop >992px. `@keyframes` fadeUp, slideIn, pulse, spin |
| **Exp 4** | Form Validation | BookAppointment: `validateDate()` checks past dates, `validateTime()` checks selection, `validateReason()` requires 10+ chars |
| **Exp 5** | Fetch API + JSON | MyMemory Translation API — `fetch(url)`, `response.json()`, `async/await` |
| **Exp 6** | Async/Await + REST API | All Firebase calls — `getDocs()`, `addDoc()`, `updateDoc()` with `async/await` + `try/catch` |

---

## 👥 Team Contributions

### 👩‍💻 Sneha Pillai — Team Lead & Frontend Architecture

> *"I was the Team Lead. I set up the React + Vite project, installed all dependencies, and configured the Firebase project. I designed the entire UI with the teal color scheme (#0d9488), Inter font, and CSS variables. I built the Landing Page with hero section and animated stats counter, Patient Dashboard fetching real Firestore data, Doctor Dashboard with today's appointment counts, and the shared Layout.jsx component used by all 20+ pages. I implemented role-based routing so patients and doctors get redirected to correct dashboards. I also added the new features — Razorpay payment gateway, Jitsi video consultation, Admin Panel, Health Analytics Dashboard, and Appointment Calendar. I deployed everything to Firebase Hosting, managed all GitHub commits, and wrote the README."*

**Files:** `App.jsx`, `Layout.jsx`, `Landing.jsx`, `PatientDashboard.jsx`, `DoctorDashboard.jsx`, `BookAppointment.jsx`, `PaymentGateway.jsx`, `VideoCall.jsx`, `AppointmentCalendar.jsx`, `HealthAnalytics.jsx`, `AdminPanel.jsx`

---

### 👨‍💻 Amit — Backend & Firebase Developer

> *"I handled the backend. I designed the Firestore database schema with 6 collections — users, doctors, patients, appointments, prescriptions, and chats. I built Firebase Authentication — register creates records in both users and doctors/patients collections simultaneously. I built the Book Appointment page with real-time form validation covering Experiment 4 — validateDate() checks for past dates, validateTime() checks slot selection, validateReason() requires minimum 10 characters. I built the Doctor Appointments page with confirm, decline, complete workflow using updateDoc(). I also built the Prescription writing system with dynamic medicine rows, dosage, frequency, duration fields, and 1mg/PharmEasy order links."*

**Files:** `AuthContext.jsx`, `Register.jsx`, `config.js`, `DoctorAppointments.jsx`, `Prescription.jsx`, `PrivateRoute.jsx`

---

### 👨‍🎨 Mudassir — UI/UX & Responsive Design

> *"I did UI/UX and Experiment 3 — Responsive Web Design. I wrote CSS media queries for 3 breakpoints — phone under 600px, tablet 600 to 991px, and desktop above 992px. On phones, the sidebar hides and grids become 1 column. On tablets, 2-column grids. On desktop, sidebar always shows and 3-4 column grids appear. I added CSS animations using @keyframes — fadeUp animates dashboard cards upward on load, slideInLeft for sidebar, pulse for the online indicator green dot, and spin for loading spinners. The sidebar collapses on mobile with a hamburger button that toggles state. I also added accessibility attributes — aria-label, aria-expanded, aria-current, and prefers-reduced-motion for users who dislike animations."*

**Files:** `Layout.jsx` (CSS), `Login.jsx`, `Register.jsx`, all responsive breakpoints in page files

---

### 👨‍🔬 Ritesh — Special Features, Testing & Documentation

> *"I built all the unique special features. For Emergency SOS with GPS — I used onMouseDown to set holding state, then useEffect with setInterval increments holdProgress by 5% every 150 milliseconds — that is 3 seconds to reach 100%, then activateSOS() is called. navigator.geolocation.getCurrentPosition() captures GPS coordinates. For Multilingual Chat — I called the MyMemory API using fetch(), translated messages in real-time, and stored both original and translated text in Firestore with onSnapshot() for real-time updates. I also built Ask Before You Book with a 5-question scoring algorithm and Medication Tracker with weekly grid and adherence ring chart. I performed end-to-end testing and wrote this README."*

**Files:** `HospitalsEmergency.jsx`, `Chat.jsx`, `HealthCenter.jsx`, `MyPrescriptions.jsx`, `README.md`

---

## 🚀 Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/SnehaPillai123/telemed-connect.git
cd telemed-connect

# 2. Install dependencies
npm install

# 3. Create .env file (see Environment Variables below)

# 4. Start development server
npm run dev

# 5. Open browser at http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
```

> ⚠️ Never commit `.env` to GitHub. It is already in `.gitignore`.

Get API keys:
- **Razorpay:** [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys
- **Gemini:** [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 🌐 Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Live at: **https://telemed-connect-6e817.web.app**

---

## 📷 Screenshots

| Page | Description |
|------|-------------|
| 🏠 Landing | Hero with animated stats counter |
| 📊 Patient Dashboard | Real-time Firestore appointment data |
| 🔍 Find Doctors | Search with specialization filters |
| 📅 Book Appointment | Date picker + Razorpay payment |
| 🤖 AI Symptom Checker | OpenRouter Llama AI analysis |
| 🆘 Emergency SOS | Hold-to-activate with GPS |
| 💬 Multilingual Chat | Hindi/Marathi/Tamil/Telugu translation |
| 📹 Video Call | Jitsi Meet embedded in app |

---

## 📝 Git Commits

| Commit | What Was Done | By |
|--------|--------------|-----|
| `Initial setup` | React + Vite project, Firebase config, folder structure | Sneha |
| `Add authentication` | Login, Register, AuthContext, PrivateRoute | Amit |
| `Add Layout and responsive design` | Sidebar, hamburger, CSS animations, 3 breakpoints | Mudassir |
| `Add Patient and Doctor Dashboard` | Firestore data, appointment stats, health tips | Sneha |
| `Add Book Appointment with validation` | Form validation Exp 4, 14 time slots, addDoc() | Amit |
| `Add Emergency SOS with GPS` | Hold-to-activate, geolocation API, hospital numbers | Ritesh |
| `Add Multilingual Chat` | MyMemory API fetch, Firestore real-time, 5 languages | Ritesh |
| `Add prescription system` | Write prescription, medicines list, order links | Amit |
| `Add Razorpay payment + Jitsi video call` | Payment gateway, VideoCall with Jitsi Meet | Sneha |
| `Add PDF prescriptions, Doctor reviews, Lab reports` | jsPDF, 5-star reviews, Firebase Storage | All |
| `Add Calendar, Analytics, Admin Panel` | 3 new pages added | Sneha |
| `Add OpenRouter AI symptom checker` | Llama AI via OpenRouter API | Sneha |
| `Remove env file from git tracking` | .env added to .gitignore, API keys secured | Sneha |

---

## 🗄️ Firestore Database Schema

```
users/{uid}          → role, email, displayName
patients/{uid}       → profile, insurance, health data
doctors/{uid}        → specialization, experience, fee, rating
appointments/{id}    → patientId, doctorId, date, time, status, paymentId
prescriptions/{id}   → patientId, doctorId, diagnosis, medicines[], notes
chats/{chatId}       → participants
  messages/{id}      → sender, text, translated, timestamp
reviews/{id}         → doctorId, patientId, rating, comment
labReports/{id}      → patientId, fileURL, reportType, reportName
```

---

<div align="center">

**Built with ❤️ by Team TeleMed Connect**

Sneha Pillai · Amit · Mudassir · Ritesh

*Pillai College of Engineering · ENGG201 · 2025–26*

[![Live](https://img.shields.io/badge/🌐_Live_at-telemed--connect--6e817.web.app-0d9488?style=for-the-badge)](https://telemed-connect-6e817.web.app)

</div>
