import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ today: 0, pending: 0, total: 0, completed: 0 });
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.displayName?.split(" ")[0] || "Doctor";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
      const snap = await getDocs(q);
      const apts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const today = new Date().toISOString().split("T")[0];
      setStats({
        today: apts.filter(a => a.appointmentDate === today).length,
        pending: apts.filter(a => a.status === "pending").length,
        total: apts.length,
        completed: apts.filter(a => a.status === "completed").length,
      });
      const sorted = [...apts].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRecentApts(sorted.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const STATUS_STYLE = {
    pending: { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
    confirmed: { bg: '#f0fdfa', color: '#0d9488', label: 'Confirmed' },
    completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .stat-card { background: white; border-radius: 10px; padding: 20px 24px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .stat-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); }
        .action-card { background: white; border-radius: 10px; padding: 16px 20px; border: 1px solid #e5e7eb; text-decoration: none; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
        .action-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); transform: translateY(-1px); }
        .apt-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .apt-row:last-child { border-bottom: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />

        {/* Page header */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{greeting},</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Dr. {firstName}</h1>
            </div>
            <Link to="/doctor-appointments" style={{ padding: '10px 20px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              View Appointments
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: "Today's Appointments", value: stats.today, color: '#0d9488', bg: '#f0fdfa', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { label: 'Pending Requests', value: stats.pending, color: '#d97706', bg: '#fffbeb', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Total Appointments', value: stats.total, color: '#2563eb', bg: '#eff6ff', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'Completed', value: stats.completed, color: '#16a34a', bg: '#f0fdf4', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontSize: 34, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                      {loading ? '—' : s.value}
                    </p>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path d={s.icon} stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

            {/* Recent appointments */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Recent Appointments</p>
                <Link to="/doctor-appointments" style={{ fontSize: 13, color: '#0d9488', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ padding: '0 20px' }}>
                {recentApts.length === 0 && !loading && (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>No appointments yet</p>
                  </div>
                )}
                {recentApts.map((apt, i) => {
                  const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
                  return (
                    <div key={i} className="apt-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>
                            {apt.patientName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{apt.patientName}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{apt.appointmentDate} · {apt.appointmentTime}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 20 }}>{st.label}</span>
                        <Link to="/doctor-appointments" style={{ fontSize: 12, color: '#0d9488', textDecoration: 'none', fontWeight: 500 }}>View</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Quick actions */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Quick Actions</p>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { to: '/doctor-appointments', label: 'Manage Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { to: '/edit-profile', label: 'Update Profile & Availability', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  ].map((a, i) => (
                    <Link key={i} to={a.to} className="action-card">
                      <div style={{ width: 34, height: 34, borderRadius: 7, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d={a.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{a.label}</p>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile reminder */}
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Profile Status</p>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, marginBottom: 10 }}>
                  <div style={{ width: '70%', height: '100%', background: '#0d9488', borderRadius: 4 }}/>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>
                  Complete your profile so patients can find and book with you.
                </p>
                <Link to="/edit-profile" style={{ fontSize: 13, fontWeight: 600, color: '#0d9488', textDecoration: 'none' }}>
                  Complete Profile →
                </Link>
              </div>

              {/* Notice */}
              <div style={{ background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1', padding: '16px 20px', borderLeft: '4px solid #0d9488' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#134e4a', marginBottom: 6 }}>Reminder</p>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
                  Review and confirm pending appointment requests promptly to give patients timely care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
