import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

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
  const [stats, setStats] = useState({ upcoming: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [tipIndex] = useState(() => new Date().getDay() % HEALTH_TIPS.length);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.displayName?.split(" ")[0] || "there";

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const snap = await getDocs(q);
      const apts = snap.docs.map(d => d.data());
      setStats({
        upcoming: apts.filter(a => a.status === "pending" || a.status === "confirmed").length,
        confirmed: apts.filter(a => a.status === "confirmed").length,
        completed: apts.filter(a => a.status === "completed").length,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const quickActions = [
    { to: '/search-doctors', label: 'Find a Doctor', desc: 'Search and book a consultation', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { to: '/symptom-checker', label: 'Check Symptoms', desc: 'AI-powered specialist matching', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { to: '/my-appointments', label: 'My Appointments', desc: 'View and manage your bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/my-prescriptions', label: 'My Prescriptions', desc: 'View and order medicines', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to: '/edit-profile', label: 'Health Profile', desc: 'Update your medical information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .stat-card { background: white; border-radius: 10px; padding: 20px 24px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .stat-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); }
        .action-card { background: white; border-radius: 10px; padding: 16px 20px; border: 1px solid #e5e7eb; text-decoration: none; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
        .action-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); transform: translateY(-1px); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />

        <main>
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 40px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{greeting}</p>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Welcome, {firstName}</h1>
              </div>
              <Link to="/search-doctors" style={{ padding: '10px 20px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Book Appointment
              </Link>
            </div>
          </header>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Upcoming Appointments', value: stats.upcoming },
                { label: 'Confirmed', value: stats.confirmed },
                { label: 'Completed Visits', value: stats.completed },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{s.label}</p>
                  <p style={{ fontSize: 36, fontWeight: 700, color: '#0d9488', lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

              {/* Quick Actions */}
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Quick Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {quickActions.map((a, i) => (
                    <Link key={i} to={a.to} className="action-card">
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path d={a.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{a.label}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{a.desc}</p>
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Health tip */}
                <div style={{ background: 'white', borderRadius: 10, padding: '20px', border: '1px solid #e5e7eb', borderLeft: '4px solid #0d9488' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Tip of the Day</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{HEALTH_TIPS[tipIndex]}</p>
                </div>

                {/* Emergency SOS */}
                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '20px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Emergency SOS</p>
                  </div>
                  <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6, marginBottom: 14 }}>
                    In a medical emergency, tap below to alert nearby hospitals and share your location instantly.
                  </p>
                  <Link to="/emergency" style={{ display: 'block', padding: '10px', background: '#ef4444', color: 'white', borderRadius: 7, fontSize: 13, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                    Activate Emergency SOS
                  </Link>
                </div>

                {/* Profile completion */}
                <div style={{ background: 'white', borderRadius: 10, padding: '20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Profile Completion</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>60%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, marginBottom: 10 }}>
                    <div style={{ width: '60%', height: '100%', background: '#0d9488', borderRadius: 4 }}/>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>
                    Complete your profile to get better doctor recommendations.
                  </p>
                  <Link to="/edit-profile" style={{ fontSize: 13, fontWeight: 600, color: '#0d9488', textDecoration: 'none' }}>
                    Complete Profile →
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
