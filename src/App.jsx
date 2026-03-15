import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import EditProfile from "./pages/EditProfile";
import SearchDoctors from "./pages/SearchDoctors";
import BookAppointment from "./pages/BookAppointment";
import DoctorAppointments from "./pages/DoctorAppointments";
import PatientAppointments from "./pages/PatientAppointments";
import SymptomChecker from "./pages/SymptomChecker";
import MyPrescriptions from "./pages/MyPrescriptions";
import Prescription from "./pages/Prescription";
import Chat from "./pages/Chat";
import Emergency from "./pages/Emergency";
import NearbyHospitals from "./pages/NearbyHospitals";
import HealthRecords from "./pages/HealthRecords";
import MedicationTracker from "./pages/MedicationTracker";
import AskBeforeBook from "./pages/AskBeforeBook";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: 10, fontSize: 14 } }}/>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient-dashboard" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
          <Route path="/doctor-dashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/search-doctors" element={<PrivateRoute><SearchDoctors /></PrivateRoute>} />
          <Route path="/book/:doctorId" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
          <Route path="/doctor-appointments" element={<PrivateRoute><DoctorAppointments /></PrivateRoute>} />
          <Route path="/my-appointments" element={<PrivateRoute><PatientAppointments /></PrivateRoute>} />
          <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
          <Route path="/my-prescriptions" element={<PrivateRoute><MyPrescriptions /></PrivateRoute>} />
          <Route path="/prescription/:appointmentId" element={<PrivateRoute><Prescription /></PrivateRoute>} />
          <Route path="/chat/:otherId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/emergency" element={<PrivateRoute><Emergency /></PrivateRoute>} />
          <Route path="/nearby-hospitals" element={<PrivateRoute><NearbyHospitals /></PrivateRoute>} />
          <Route path="/health-records" element={<PrivateRoute><HealthRecords /></PrivateRoute>} />
          <Route path="/medication-tracker" element={<PrivateRoute><MedicationTracker /></PrivateRoute>} />
          <Route path="/ask-before-book" element={<PrivateRoute><AskBeforeBook /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;