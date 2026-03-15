import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";
import PatientSidebar from "../components/PatientSidebar";

const HEALTH_TIPS = [
  "Drink at least 8 glasses of water daily to stay hydrated and maintain energy levels.",
  "A 10-minute walk after meals can reduce blood sugar levels by up to 22%.",
  "Sleep 7–8 hours per night. Your brain clears harmful toxins only during deep sleep.",
  "Deep breathing for 5 minutes a day reduces cortisol and significantly lowers stress.",
  "Washing hands for 20 seconds prevents over 80% of common infections.",
  "Eating slowly and mindfully aids digestion and helps prevent overeating.",
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

  const STATUS_STYLE = {
    pending:   { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
    confirmed: { color: '#0d9488', bg: '#f0fdfa', label: 'Confirmed' },
    completed: { color: '#16a34a', bg: '#f0fdf4', label: 'Completed' },
    cancelled: { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled' },
  };

  const quickActions = [
    { to: '/search-doctors', label: 'Find a Doctor', desc: 'Search and book a consultation', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { to: '/ask-before-book', label: 'Ask Before You Book', desc: 'Not sure if you need a doctor?', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: 'Smart' },
    { to: '/symptom-checker', label: 'Symptom Checker', desc: 'AI-powered specialist matching', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: 'AI' },
    { to: '/medication-tracker', label: 'Medication Tracker', desc: 'Track your daily medicines', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', badge: 'New' },
    { to: '/health-records', label: 'Health Records', desc: 'Your complete medical history', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: 'New' },
    { to: '/nearby-hospitals', label: 'Nearby Hospitals', desc: 'Find hospitals near you', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .dashboard-layout { display: flex; min-height: 100vh; background: #f9fafb; }
        .main-content { margin-left: 250px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .top-bar { background: white; border-bottom: 1px solid #e5e7eb; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }
        .content { padding: 28px 32px; flex: 1; }
        .stat-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px 24px; transition: all 0.2s; text-decoration: none; display: block; }
        .stat-card:hover { border-color: #0d9488; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.08); }
        .action-tile { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 16px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .action-tile:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); transform: translateX(3px); }
        .apt-row { padding: 12px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f9fafb; }
        .apt-row:last-child { border-bottom: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @media screen and (max-width: 768px) { .main-content { margin-left: 0; } .content { padding: 16px; } }
      `}</style>

      <div className="dashboard-layout">
        <PatientSidebar />

        <main className="main-content">
          {/* Top bar */}
          <header className="top-bar">
            <div>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{greeting}</p>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Welcome back, {firstName}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdfa', borderRadius: 7, border: '1px solid #ccfbf1' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}/>
                <span style={{ fontSize: 11, color: '#0f766e', fontWeight: 600 }}>Online</span>
              </div>
              <Link to="/search-doctors" style={{ padding: '8px 16px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                Book Appointment
              </Link>
            </div>
          </header>

          <div className="content">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Upcoming', value: stats.upcoming, color: '#0d9488', to: '/my-appointments' },
                { label: 'Confirmed', value: stats.confirmed, color: '#2563eb', to: '/my-appointments' },
                { label: 'Completed', value: stats.completed, color: '#16a34a', to: '/my-appointments' },
              ].map((s, i) => (
                <Link key={i} to={s.to} className="stat-card fade-up" style={{ animationDelay: `${i*0.07}s`, opacity: 0 }}>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>{s.label} Appointments</p>
                  <p style={{ fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? '—' : s.value}</p>
                </Link>
              ))}
            </div>

            {/* Main 3 column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 20 }}>

              {/* Recent appointments */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }} className="fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Appointments</p>
                  <Link to="/my-appointments" style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                </div>
                {recentApts.length === 0 && !loading ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>No appointments yet</p>
                    <Link to="/search-doctors" style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 8 }}>Book your first →</Link>
                  </div>
                ) : (
                  recentApts.map((apt, i) => {
                    const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
                    return (
                      <div key={i} className="apt-row">
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>
                            {apt.doctorName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 1 }}>Dr. {apt.doctorName}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af' }}>{apt.appointmentDate} · {apt.appointmentTime}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 9px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Quick Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quickActions.map((a, i) => (
                    <Link key={i} to={a.to} className="action-tile">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d={a.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.label}</p>
                          {a.badge && <span style={{ fontSize: 9, fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: 20, border: '1px solid #ccfbf1' }}>{a.badge}</span>}
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>{a.desc}</p>
                      </div>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Health tip */}
                <div style={{ background: 'white', borderRadius: 10, padding: '16px', border: '1px solid #e5e7eb', borderLeft: '4px solid #0d9488' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Health Tip of the Day</p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>{HEALTH_TIPS[tipIndex]}</p>
                </div>

                {/* Ask before book promo */}
                <Link to="/ask-before-book" style={{ background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)', borderRadius: 10, padding: '16px', border: '1px solid #ccfbf1', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Not sure if you need a doctor?</p>
                  </div>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>Answer 5 quick questions and get instant guidance.</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>Try Ask Before You Book →</p>
                </Link>

                {/* Emergency */}
                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '16px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Emergency SOS</p>
                  </div>
                  <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>One tap alerts hospitals & shares your location instantly.</p>
                  <Link to="/emergency" style={{ display: 'block', padding: '8px', background: '#ef4444', color: 'white', borderRadius: 7, fontSize: 12, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
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
