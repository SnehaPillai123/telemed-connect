import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const [stats, setStats] = useState({ appointments: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const snap = await getDocs(q);
      const apts = snap.docs.map(d => d.data());
      setStats({
        appointments: apts.filter(a => a.status === "pending" || a.status === "confirmed").length,
        confirmed: apts.filter(a => a.status === "confirmed").length,
        completed: apts.filter(a => a.status === "completed").length,
      });
    };
    fetchStats();
  }, [user]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .dash-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .dash-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { transform: translateX(4px); }
        .stat-card { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%)', padding: '48px 48px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(13,148,136,0.15)' }}/>
          <div style={{ position: 'absolute', bottom: -80, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <p style={{ color: '#94a3b8', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting}</p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 36, fontWeight: 400, margin: '0 0 6px' }}>{user?.displayName}</h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>Your personal health dashboard</p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Upcoming Appointments', value: stats.appointments, color: '#0d9488', border: '#0d9488' },
              { label: 'Confirmed', value: stats.confirmed, color: '#0284c7', border: '#0284c7' },
              { label: 'Completed', value: stats.completed, color: '#7c3aed', border: '#7c3aed' },
            ].map((stat, i) => (
              <div key={i} className="stat-card dash-card" style={{ background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${stat.border}` }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{stat.label}</p>
                <p style={{ fontSize: 40, fontWeight: 300, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Quick Actions */}
            <div className="dash-card" style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { to: '/search-doctors', label: 'Find a Specialist', desc: 'Search and book consultations', color: '#0d9488' },
                  { to: '/symptom-checker', label: 'AI Symptom Checker', desc: 'Get AI-powered specialist advice', color: '#7c3aed' },
                  { to: '/my-appointments', label: 'My Appointments', desc: 'View and manage your bookings', color: '#0284c7' },
                  { to: '/edit-profile', label: 'Edit Profile', desc: 'Update personal & medical info', color: '#64748b' },
                ].map((item, i) => (
                  <Link key={i} to={item.to} className="action-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 12, background: '#f8fafc', textDecoration: 'none', border: '1px solid #f1f5f9' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</p>
                    </div>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" stroke={item.color} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="dash-card" style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Health Tools</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Symptom Checker', desc: 'AI-powered analysis of your symptoms', to: '/symptom-checker', bg: '#f0fdfa', color: '#0d9488', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15v-4m0-4h.01' },
                  { label: 'My Prescriptions', desc: 'View prescriptions from your doctors', to: '/my-prescriptions', bg: '#f0f9ff', color: '#0284c7', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { label: 'Find Doctors', desc: 'Browse specialists near you', to: '/search-doctors', bg: '#faf5ff', color: '#7c3aed', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
                ].map((tool, i) => (
                  <Link key={i} to={tool.to} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderRadius: 12, background: tool.bg, textDecoration: 'none', transition: 'all 0.2s', border: '1px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d={tool.icon} stroke={tool.color} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{tool.label}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{tool.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}