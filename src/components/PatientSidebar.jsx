import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      { to: '/patient-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/my-appointments', label: 'My Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/search-doctors', label: 'Find Doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    ]
  },
  {
    title: "Health Tools",
    items: [
      { to: '/ask-before-book', label: 'Ask Before You Book', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: 'Smart' },
      { to: '/symptom-checker', label: 'Symptom Checker', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: 'AI' },
      { to: '/my-prescriptions', label: 'Prescriptions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { to: '/medication-tracker', label: 'Medication Tracker', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', badge: 'New' },
      { to: '/health-records', label: 'Health Records', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ]
  },
  {
    title: "Care",
    items: [
      { to: '/nearby-hospitals', label: 'Nearby Hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { to: '/edit-profile', label: 'Health Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { to: '/emergency', label: 'Emergency SOS', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', emergency: true },
    ]
  }
];

export default function PatientSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .ps-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; text-decoration: none; color: #6b7280; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .ps-item:hover { background: #f0fdfa; color: #0d9488; }
        .ps-item.active { background: #f0fdfa; color: #0d9488; font-weight: 600; }
        .ps-item.emer { color: #dc2626; }
        .ps-item.emer:hover { background: #fef2f2; color: #dc2626; }
        .ps-item.emer.active { background: #fef2f2; color: #dc2626; }
        .ps-badge { font-size: 9px; font-weight: 700; color: #0d9488; background: #f0fdfa; padding: 1px 6px; border-radius: 20px; border: 1px solid #ccfbf1; flex-shrink: 0; }
        .ps-signout { width: 100%; padding: 9px 12px; background: none; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: Inter, sans-serif; transition: all 0.15s; }
        .ps-signout:hover { border-color: #0d9488; color: #0d9488; }
      `}</style>

      <aside style={{ width: 250, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, overflowY: 'auto' }}>

        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.1 }}>TeleMed Connect</p>
            <p style={{ fontSize: 9, color: '#0d9488', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Patient Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 3px' }}>{section.title}</p>
              {section.items.map((item, ii) => (
                <Link key={ii} to={item.to}
                  className={`ps-item ${item.emergency ? 'emer' : ''} ${location.pathname === item.to ? 'active' : ''}`}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span className="ps-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User + signout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 8, background: '#f9fafb', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.displayName}</p>
              <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 500 }}>Patient</p>
            </div>
          </div>
          <button className="ps-signout" onClick={handleSignOut}>
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