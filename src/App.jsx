import BookAppointment from "./pages/BookAppointment";import SearchDoctors from "./pages/SearchDoctors";import EditProfile from "./pages/EditProfile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

function PrivateRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-teal-600 text-xl font-medium">Loading...</p>
  </div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient-dashboard" element={
            <PrivateRoute allowedRole="patient">
              <PatientDashboard />
            </PrivateRoute>
          } />
          <Route path="/doctor-dashboard" element={
            <PrivateRoute allowedRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          } /><Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
         <Route path="/search-doctors" element={<PrivateRoute><SearchDoctors /></PrivateRoute>} /><Route path="/book/:doctorId" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;