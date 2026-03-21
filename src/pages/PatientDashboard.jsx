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
      setRecentApts([...apts].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5));
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

        .stat-card {
          background: white; border-radius: 12px; border: 1px solid #e5e7eb;
          padding: 20px; text-decoration: none; display: block;
          transition: all 0.2s;
        }
        .stat-card:hover {
          border-color: #0d9488; transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(13,148,136,0.1);
        }

        .apt-row {
          padding: 12px 16px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid #f3f4f6; transition: background 0.15s;
        }
        .apt-row:last-child { border-bottom: none; }
        .apt-row:hover { background: #f9fafb; }

        .widget-card {
          background: white; border-radius: 12px; border: 1px solid #e5e7eb;
          padding: 16px; transition: all 0.2s;
        }
        .widget-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.07); }

        /* Responsive overrides */
        @media screen and (max-width: 991px) {
          .dash-stats  { grid-template-columns: repeat(3,1fr) !important; }
          .dash-main   { grid-template-columns: 1fr !important; }
        }
        @media screen and (max-width: 599px) {
          .dash-stats  { grid-template-columns: 1fr !important; }
          .dash-main   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── STATS ROW ── */}
      <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Upcoming Appointments', value: stats.upcoming, color: '#0d9488', bg: '#f0fdfa', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', to: '/my-appointments' },
          { label: 'Confirmed', value: stats.confirmed, color: '#2563eb', bg: '#eff6ff', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', to: '/my-appointments' },
          { label: 'Completed Visits', value: stats.completed, color: '#16a34a', bg: '#f0fdf4', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', to: '/my-appointments' },
        ].map((s, i) => (
          <Link key={i} to={s.to} className="stat-card fade-up" style={{ animationDelay: `${i*0.07}s`, opacity: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d={s.icon} stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>
              {loading ? '—' : s.value}
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* ── MAIN GRID: appointments + widgets ── */}
      <div className="dash-main" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Recent Appointments */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Recent Appointments</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Your latest consultations</p>
            </div>
            <Link to="/my-appointments" style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/></svg>
            </Link>
          </div>

          {loading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && recentApts.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No appointments yet</p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Book your first consultation to get started</p>
              <Link to="/search-doctors" style={{ padding: '9px 20px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Find a Doctor
              </Link>
            </div>
          )}

          {!loading && recentApts.map((apt, i) => {
            const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
            return (
              <div key={i} className="apt-row">
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>
                    {apt.doctorName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Dr. {apt.doctorName}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>
                    {apt.doctorSpecialization} · {apt.appointmentDate}
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {st.label}
                </span>
              </div>
            );
          })}

          {!loading && recentApts.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <Link to="/search-doctors" style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                + Book a new appointment
              </Link>
            </div>
          )}
        </div>

        {/* Right column — widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Health tip */}
          <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e5e7eb', borderLeft: '4px solid #0d9488' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Tip Today</p>
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{HEALTH_TIPS[tipIndex]}</p>
          </div>

          {/* Profile completion */}
          <div className="widget-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Profile Completion</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>60%</span>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, marginBottom: 10 }}>
              <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #0d9488, #0284c7)', borderRadius: 4, transition: 'width 1s ease' }}/>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Complete your profile for better doctor recommendations.</p>
            <Link to="/edit-profile" style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', textDecoration: 'none' }}>
              Complete Profile →
            </Link>
          </div>

          {/* Ask before book */}
          <Link to="/ask-before-book" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', borderRadius: 12, padding: '16px', border: '1px solid #ccfbf1', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(13,148,136,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>Not sure you need a doctor?</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', background: 'rgba(13,148,136,0.1)', padding: '1px 7px', borderRadius: 20 }}>Smart</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>Answer 5 quick questions and get instant guidance on whether to consult a doctor.</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>Try Ask Before You Book →</p>
          </Link>

          {/* Emergency SOS */}
          <div style={{ background: '#fef2f2', borderRadius: 12, padding: '16px', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Emergency SOS</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>One tap · GPS · Hospitals alerted</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>
              Instantly shares your location with nearby hospitals and emergency contacts.
            </p>
            <Link to="/emergency" style={{ display: 'block', padding: '9px', background: '#ef4444', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => e.target.style.background='#dc2626'}
              onMouseLeave={e => e.target.style.background='#ef4444'}>
              🚨 Activate Emergency SOS
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
