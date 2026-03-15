import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .navbar * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .nav-link { font-size: 13px; font-weight: 500; color: #374151; text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: all 0.15s; }
        .nav-link:hover { background: #f0fdfa; color: #0d9488; }
        .signout-btn { padding: 7px 16px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .signout-btn:hover { border-color: #0d9488; color: #0d9488; }
      `}</style>

      <nav className="navbar" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>

        <Link to={role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.2 }}>TeleMed Connect</p>
            <p style={{ fontSize: 10, color: '#0d9488', margin: 0, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Healthcare Platform</p>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {role === 'patient' && <>
            <Link to="/patient-dashboard" className="nav-link">Dashboard</Link>
            <Link to="/search-doctors" className="nav-link">Find Doctors</Link>
            <Link to="/my-appointments" className="nav-link">Appointments</Link>
            <Link to="/symptom-checker" className="nav-link">Symptom Checker</Link>
            <Link to="/my-prescriptions" className="nav-link">Prescriptions</Link>
          </>}
          {role === 'doctor' && <>
            <Link to="/doctor-dashboard" className="nav-link">Dashboard</Link>
            <Link to="/doctor-appointments" className="nav-link">Appointments</Link>
            <Link to="/edit-profile" className="nav-link">Profile</Link>
          </>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdfa', borderRadius: 6, border: '1px solid #ccfbf1' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}/>
            <span style={{ fontSize: 12, color: '#0f766e', fontWeight: 500 }}>Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>{user?.displayName}</span>
              <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 500, textTransform: 'capitalize' }}>{role === 'doctor' ? 'Medical Professional' : 'Patient'}</span>
            </div>
          </div>
          <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </nav>
    </>
  );
}