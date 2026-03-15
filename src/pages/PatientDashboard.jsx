import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const HEALTH_TIPS = [
  "Drink at least 8 glasses of water daily to stay hydrated and maintain energy levels.",
  "A 10-minute walk after meals can reduce blood sugar levels by up to 22%.",
  "Sleep 7–8 hours per night. Your brain clears harmful toxins only during deep sleep.",
  "Deep breathing for 5 minutes a day lowers cortisol and significantly reduces stress.",
  "Washing hands for 20 seconds prevents over 80% of common infections.",
  "Eating slowly and mindfully aids digestion and helps prevent overeating.",
];

export default function PatientDashboard() {
  const { user } = useAuth();
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
      setRecentApts([...apts].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 4));
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

  return (
    <Layout title={`${greeting}, ${firstName} 👋`} subtitle="Patient Dashboard">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .stat-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 18px 20px; text-decoration: none; display: block; transition: all 0.2s; }
        .stat-card:hover { border-color: #0d9488; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,148,136,0.08); }
        .action-tile { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 14px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .action-tile:hover { border-color: #0d9488; box-shadow: 0 4px 14px rgba(13,148,136,0.08); transform: translateX(3px); }
        .apt-row { padding: 11px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
        .apt-row:last-child { border-bottom: none; }
        .apt-row:hover { background: #fafafa; }
        @media screen and (max-width: 1024px) { .dash-grid { grid-template-columns: 1fr 1fr !important; } }
        @media screen and (max-width: 640px) { .stats-row { grid-template-columns: 1fr !important; } .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Stats */}
<div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {[
          { label: 'Upcoming', value: stats.upcoming, color: '#0d9488', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', to: '/my-appointments' },
          { label: 'Confirmed', value: stats.confirmed, color: '#2563eb', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', to: '/my-appointments' },
          { label: 'Completed', value: stats.completed, color: '#16a34a', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', to: '/my-appointments' },
        ].map((s, i) => (
          <Link key={i} to={s.to} className="stat-card fade-up" style={{ animationDelay: `${i*0.06}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d={s.icon} stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{loading ? '—' : s.value}</p>
            <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label} Appointments</p>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Recent Appointments */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Recent Appointments</p>
            <Link to="/my-appointments" style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentApts.length === 0 && !loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>No appointments yet</p>
              <Link to="/search-doctors" style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Book your first →</Link>
            </div>
          )}
          {recentApts.map((apt, i) => {
            const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
            return (
              <div key={i} className="apt-row">
                <div style={{ width: 32, height: 32, borderRadius: 7, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0d9488' }}>{apt.doctorName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {apt.doctorName}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>{apt.appointmentDate}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
              </div>
            );
          })}
        </div>
        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Health tip */}
          <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', borderLeft: '4px solid #0d9488' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Health Tip Today</p>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>{HEALTH_TIPS[tipIndex]}</p>
          </div>

          {/* Ask before book */}
          <Link to="/ask-before-book" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', borderRadius: 10, padding: '14px 16px', border: '1px solid #ccfbf1', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform='none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Not sure you need a doctor?</p>
            </div>
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginBottom: 7 }}>Answer 5 quick questions for instant guidance.</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>Try Ask Before You Book →</p>
          </Link>

          {/* Emergency */}
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '14px 16px', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Emergency SOS</p>
            </div>
            <p style={{ fontSize: 11, color: '#991b1b', lineHeight: 1.6, marginBottom: 9 }}>One tap alerts hospitals & shares your GPS location.</p>
            <Link to="/emergency" style={{ display: 'block', padding: '8px', background: '#ef4444', color: 'white', borderRadius: 7, fontSize: 12, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
              Activate Emergency SOS
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
