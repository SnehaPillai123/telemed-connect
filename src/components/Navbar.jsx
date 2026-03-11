import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        .navbar { font-family: 'DM Sans', sans-serif; }
        .nav-link { transition: color 0.2s ease; }
        .nav-link:hover { color: #0d9488; }
        .logout-btn { transition: all 0.2s ease; }
        .logout-btn:hover { background: #fee2e2; color: #dc2626; }
      `}</style>
      <nav className="navbar bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-50"
        style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
           className="flex items-center gap-3" style={{textDecoration:'none'}}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #0d9488, #0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="white" opacity="0.3"/>
                <path d="M12 6v4M12 14v4M8 12H4M20 12h-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'DM Serif Display', fontSize: 15, color: '#0f172a', lineHeight: 1 }}>
                TeleMed Connect
              </p>
              <p style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Healthcare Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: 14
                  }}>
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {user.displayName}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>
                      {role === "doctor" ? "Medical Professional" : "Patient"}
                    </p>
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: '#e2e8f0' }}/>
                <button onClick={handleLogout} className="logout-btn"
                  style={{
                    fontSize: 13, fontWeight: 500, color: '#64748b',
                    padding: '6px 14px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer'
                  }}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}