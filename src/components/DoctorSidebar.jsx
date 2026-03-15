import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      { to: '/doctor-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/doctor-appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/edit-profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ]
  },
  {
    title: "Doctor Tools",
    items: [
      { to: '/doctor-appointments', label: 'Write Prescription', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { to: '/edit-profile', label: 'Set Availability', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { to: '/edit-profile', label: 'Consultation Fee', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  }
];

export default function DoctorSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "DR";

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .ds-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; text-decoration: none; color: #6b7280; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .ds-item:hover { background: #f0fdfa; color: #0d9488; }
        .ds-item.active { background: #f0fdfa; color: #0d9488; font-weight: 600; }
        .ds-signout { width: 100%; padding: 9px 12px; background: none; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: Inter, sans-serif; transition: all 0.15s; }
        .ds-signout:hover { border-color: #0d9488; color: #0d9488; }
      `}</style>

      <aside style={{ width: 250, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, overflowY: 'auto' }}>

        <div style={{ padding: '18px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.1 }}>TeleMed Connect</p>
            <p style={{ fontSize: 9, color: '#0d9488', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Doctor Portal</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 3px' }}>{section.title}</p>
              {section.items.map((item, ii) => (
                <Link key={ii} to={item.to} className={`ds-item ${location.pathname === item.to ? 'active' : ''}`}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 8, background: '#f9fafb', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {user?.displayName}</p>
              <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 500 }}>Medical Professional</p>
            </div>
          </div>
          <button className="ds-signout" onClick={handleSignOut}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}