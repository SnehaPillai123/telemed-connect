import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const [stats, setStats] = useState({ today: 0, pending: 0, total: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
      const snap = await getDocs(q);
      const apts = snap.docs.map(d => d.data());
      const today = new Date().toISOString().split("T")[0];
      setStats({
        today: apts.filter(a => a.appointmentDate === today).length,
        pending: apts.filter(a => a.status === "pending").length,
        total: apts.length,
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

        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0284c7 100%)', padding: '48px 48px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(2,132,199,0.15)' }}/>
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <p style={{ color: '#94a3b8', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{greeting}, Doctor</p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 36, fontWeight: 400, margin: '0 0 6px' }}>Dr. {user?.displayName}</h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>Manage your patients and appointments</p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: "Today's Appointments", value: stats.today, color: '#0284c7', border: '#0284c7' },
              { label: 'Pending Requests', value: stats.pending, color: '#f59e0b', border: '#f59e0b' },
              { label: 'Total Appointments', value: stats.total, color: '#0d9488', border: '#0d9488' },
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
                  { to: '/doctor-appointments', label: 'View Appointments', desc: 'Manage and confirm bookings', color: '#0284c7' },
                  { to: '/edit-profile', label: 'Complete Your Profile', desc: 'Add specialization and availability', color: '#0d9488' },
                  { to: '/edit-profile', label: 'Set Availability', desc: 'Manage your consultation hours', color: '#7c3aed' },
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

            {/* Doctor Tools */}
            <div className="dash-card" style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Doctor Tools</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Appointments', desc: 'Confirm, decline, or complete bookings', to: '/doctor-appointments', bg: '#f0f9ff', color: '#0284c7', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: 'Write Prescription', desc: 'Create prescriptions with order links', to: '/doctor-appointments', bg: '#f0fdfa', color: '#0d9488', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                  { label: 'Profile & Availability', desc: 'Update your professional details', to: '/edit-profile', bg: '#faf5ff', color: '#7c3aed', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                ].map((tool, i) => (
                  <Link key={i} to={tool.to} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderRadius: 12, background: tool.bg, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d={tool.icon} stroke={tool.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
