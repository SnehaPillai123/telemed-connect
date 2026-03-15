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
import MyPrescriptions from "./pages/MyPrescriptions";
import Prescription from "./pages/Prescription";
import Chat from "./pages/Chat";
import HealthCenter from "./pages/HealthCenter";
import HospitalsEmergency from "./pages/HospitalsEmergency";

function PrivateRoute({ children, doctorOnly = false, patientOnly = false }) {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (doctorOnly && role !== 'doctor') return <Navigate to="/patient-dashboard" />;
  if (patientOnly && role !== 'patient') return <Navigate to="/doctor-dashboard" />;
  return children;
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/" />;
  if (role === 'doctor') return <Navigate to="/doctor-dashboard" />;
  return <Navigate to="/patient-dashboard" />;
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
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route path="/patient-dashboard" element={<PrivateRoute patientOnly><PatientDashboard /></PrivateRoute>} />
          <Route path="/doctor-dashboard" element={<PrivateRoute doctorOnly><DoctorDashboard /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/search-doctors" element={<PrivateRoute patientOnly><SearchDoctors /></PrivateRoute>} />
          <Route path="/book/:doctorId" element={<PrivateRoute patientOnly><BookAppointment /></PrivateRoute>} />
          <Route path="/doctor-appointments" element={<PrivateRoute doctorOnly><DoctorAppointments /></PrivateRoute>} />
          <Route path="/my-appointments" element={<PrivateRoute patientOnly><PatientAppointments /></PrivateRoute>} />
          <Route path="/my-prescriptions" element={<PrivateRoute patientOnly><MyPrescriptions /></PrivateRoute>} />
          <Route path="/prescription/:appointmentId" element={<PrivateRoute doctorOnly><Prescription /></PrivateRoute>} />
          <Route path="/chat/:otherId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/health-center" element={<PrivateRoute patientOnly><HealthCenter /></PrivateRoute>} />
          <Route path="/nearby-hospitals" element={<PrivateRoute patientOnly><HospitalsEmergency /></PrivateRoute>} />
          {/* Old routes redirect to new combined pages */}
          <Route path="/symptom-checker" element={<Navigate to="/health-center" />} />
          <Route path="/ask-before-book" element={<Navigate to="/health-center" />} />
          <Route path="/medication-tracker" element={<Navigate to="/my-prescriptions" />} />
          <Route path="/health-records" element={<Navigate to="/my-appointments" />} />
          <Route path="/emergency" element={<Navigate to="/nearby-hospitals" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;