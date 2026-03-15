import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";

const HEALTH_TIPS = [
  "Drink at least 8 glasses of water daily to stay hydrated and maintain energy levels.",
  "A 10-minute walk after meals can reduce blood sugar levels by up to 22%.",
  "Sleep 7–8 hours per night. Your brain clears harmful toxins only during deep sleep.",
  "Deep breathing for 5 minutes a day reduces cortisol and significantly lowers stress.",
  "Washing hands for 20 seconds prevents over 80% of common infections.",
  "Eating slowly and mindfully aids digestion and helps prevent overeating.",
];

const NAV_ITEMS = [
  { to: '/patient-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/search-doctors', label: 'Find Doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/my-appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/symptom-checker', label: 'Symptom Checker', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/my-prescriptions', label: 'Prescriptions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/edit-profile', label: 'Health Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ upcoming: 0, confirmed: 0, completed: 0 });
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipIndex] = useState(() => new Date().getDay() % HEALTH_TIPS.length);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.displayName?.split(" ")[0] || "there";
  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const snap = await getDocs(q);
      const apts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStats({
        upcoming: apts.filter(a => a.status === "pending" || a.status === "confirmed").length,
        confirmed: apts.filter(a => a.status === "confirmed").length,
        completed: apts.filter(a => a.status === "completed").length,
      });
      const sorted = [...apts].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRecentApts(sorted.slice(0, 3));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const STATUS_STYLE = {
    pending:   { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
    confirmed: { color: '#0d9488', bg: '#f0fdfa', label: 'Confirmed' },
    completed: { color: '#16a34a', bg: '#f0fdf4', label: 'Completed' },
    cancelled: { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        .dashboard-layout { display: flex; min-height: 100vh; background: #f9fafb; }

        /* Sidebar */
        .sidebar { width: 260px; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; overflow-y: auto; flex-shrink: 0; }
        .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 10px; }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 9px; text-decoration: none; color: #6b7280; font-size: 14px; font-weight: 500; transition: all 0.15s; }
        .nav-item:hover { background: #f0fdfa; color: #0d9488; }
        .nav-item.active { background: #f0fdfa; color: #0d9488; font-weight: 600; }
        .nav-item svg { flex-shrink: 0; }
        .sidebar-bottom { padding: 16px 12px; border-top: 1px solid #f3f4f6; }
        .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; background: #f9fafb; margin-bottom: 8px; }

        /* Main content */
        .main-content { margin-left: 260px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        /* Top bar */
        .top-bar { background: white; border-bottom: 1px solid #e5e7eb; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }

        /* Content */
        .content { padding: 32px; flex: 1; }

        /* Cards */
        .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
        .stat-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px; transition: all 0.2s; }
        .stat-card:hover { border-color: #0d9488; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.08); }
        .action-tile { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s; }
        .action-tile:hover { border-color: #0d9488; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.08); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        /* Responsive */
        @media screen and (max-width: 1024px) {
          .sidebar { width: 220px; }
          .main-content { margin-left: 220px; }
        }
        @media screen and (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0; }
          .content { padding: 16px; }
        }
      `}</style>

      <div className="dashboard-layout">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar" role="navigation" aria-label="Patient navigation">
          {/* Logo */}
          <div className="sidebar-logo">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#111827', lineHeight: 1.1 }}>TeleMed Connect</p>
              <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Patient Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px 4px' }}>Main Menu</p>
            {NAV_ITEMS.map((item, i) => (
              <Link key={i} to={item.to} className={`nav-item ${window.location.pathname === item.to ? 'active' : ''}`}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item.label}
              </Link>
            ))}

            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 14px 4px' }}>Emergency</p>
            <Link to="/emergency" className="nav-item" style={{ color: '#dc2626' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Emergency SOS
            </Link>
          </nav>

          {/* User + signout */}
          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.displayName}</p>
                <p style={{ fontSize: 11, color: '#0d9488', fontWeight: 500 }}>Patient</p>
              </div>
            </div>
            <button onClick={handleSignOut}
              style={{ width: '100%', padding: '9px 14px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#0d9488'; e.currentTarget.style.color='#0d9488'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#374151'; }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">

          {/* Top bar */}
          <header className="top-bar">
            <div>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{greeting}</p>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Welcome back, {firstName}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdfa', borderRadius: 8, border: '1px solid #ccfbf1' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} aria-hidden="true"/>
                <span style={{ fontSize: 12, color: '#0f766e', fontWeight: 600 }}>Online</span>
              </div>
              <Link to="/search-doctors" style={{ padding: '9px 18px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Book Appointment
              </Link>
            </div>
          </header>

          <div className="content">

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
              {[
                { label: 'Upcoming Appointments', value: stats.upcoming, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', link: '/my-appointments' },
                { label: 'Confirmed', value: stats.confirmed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', link: '/my-appointments' },
                { label: 'Completed Visits', value: stats.completed, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', link: '/my-appointments' },
              ].map((s, i) => (
                <Link key={i} to={s.link} className="stat-card fade-up" style={{ animationDelay: `${i*0.08}s`, opacity: 0, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={s.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 38, fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: 6 }}>
                    {loading ? '—' : s.value}
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</p>
                </Link>
              ))}
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 20, marginBottom: 20 }}>

              {/* Recent Appointments */}
              <div className="card fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Appointments</p>
                  <Link to="/my-appointments" style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {recentApts.length === 0 && !loading && (
                    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: '#9ca3af' }}>No appointments yet</p>
                    </div>
                  )}
                  {recentApts.map((apt, i) => {
                    const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
                    return (
                      <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < recentApts.length-1 ? '1px solid #f9fafb' : 'none' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>
                            {apt.doctorName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Dr. {apt.doctorName}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{apt.appointmentDate} · {apt.appointmentTime}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="fade-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Quick Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, height: 'calc(100% - 30px)' }}>
                  {[
                    { to: '/search-doctors', label: 'Find a Doctor', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                    { to: '/symptom-checker', label: 'Check Symptoms', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                    { to: '/my-prescriptions', label: 'Prescriptions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { to: '/edit-profile', label: 'Health Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  ].map((a, i) => (
                    <Link key={i} to={a.to} className="action-tile">
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <path d={a.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.label}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Health tip */}
                <div className="card fade-up" style={{ animationDelay: '0.3s', opacity: 0, padding: '18px 20px', borderLeft: '4px solid #0d9488' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Health Tip of the Day</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{HEALTH_TIPS[tipIndex]}</p>
                </div>

                {/* Profile completion */}
                <div className="card fade-up" style={{ animationDelay: '0.35s', opacity: 0, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Profile Completion</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>60%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, marginBottom: 10 }}>
                    <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #0d9488, #0284c7)', borderRadius: 4 }}/>
                  </div>
                  <Link to="/edit-profile" style={{ fontSize: 13, fontWeight: 600, color: '#0d9488', textDecoration: 'none' }}>Complete Profile →</Link>
                </div>

                {/* Emergency SOS */}
                <div className="fade-up" style={{ animationDelay: '0.4s', opacity: 0, background: '#fef2f2', borderRadius: 12, padding: '18px 20px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Emergency SOS</p>
                  </div>
                  <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6, marginBottom: 12 }}>
                    One tap alerts nearby hospitals and shares your location instantly.
                  </p>
                  <Link to="/emergency" style={{ display: 'block', padding: '10px', background: '#ef4444', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                    Activate Emergency SOS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
