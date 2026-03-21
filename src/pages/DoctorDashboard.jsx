import NextStepBanner from "../components/NextStepBanner";import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <Layout title={`${greeting}, Dr. ${firstName} 👨‍⚕️`} subtitle="Doctor Dashboard">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .stat-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 18px 20px; transition: all 0.2s; }
        .stat-card:hover { border-color: #0d9488; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,148,136,0.08); }
        .apt-row { padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
        .apt-row:last-child { border-bottom: none; }
        .apt-row:hover { background: #fafafa; }
        .action-link { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-radius: 8px; text-decoration: none; transition: all 0.15s; }
        .action-link:hover { transform: translateX(3px); }
        @media screen and (max-width: 1024px) { .doc-grid { grid-template-columns: 1fr !important; } }
        @media screen and (max-width: 640px) { .doc-stats { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      {/* Stats */}
     <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: "Today's", value: stats.today, color: '#0d9488', bg: '#f0fdfa', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#fffbeb', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Total', value: stats.total, color: '#2563eb', bg: '#eff6ff', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Completed', value: stats.completed, color: '#16a34a', bg: '#f0fdf4', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((s, i) => (
          <div key={i} className="stat-card fade-up" style={{ animationDelay: `${i*0.06}s`, opacity: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d={s.icon} stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{loading ? '—' : s.value}</p>
            <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label} Appointments</p>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Appointments list */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Recent Appointments</p>
            <Link to="/doctor-appointments" style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentApts.length === 0 && !loading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>No appointments yet</p>
            </div>
          )}
          {recentApts.map((apt, i) => {
            const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
            return (
              <div key={i} className="apt-row">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{apt.patientName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 1 }}>{apt.patientName}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{apt.appointmentDate} · {apt.appointmentTime}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 9px', borderRadius: 20, flexShrink: 0 }}>{st.label}</span>
                {apt.status === 'pending' && (
                  <Link to="/doctor-appointments" style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>Review</Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Dr. {user?.displayName}</p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>Medical Professional</p>
              </div>
            </div>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }}>
              <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #0d9488, #0284c7)', borderRadius: 4 }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: '#6b7280' }}>Profile 70% complete</p>
              <Link to="/edit-profile" style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Complete →</Link>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Quick Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/doctor-appointments', label: `${stats.pending} pending requests`, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                { to: '/doctor-appointments', label: 'View all appointments', color: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1' },
                { to: '/edit-profile', label: 'Update availability', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              ].map((a, i) => (
                <Link key={i} to={a.to}
                  className="action-link"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: a.color }}>{a.label}</p>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke={a.color} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div style={{ background: '#f0fdfa', borderRadius: 10, padding: '16px', border: '1px solid #ccfbf1', borderLeft: '4px solid #0d9488' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#134e4a', marginBottom: 5 }}>Reminder</p>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>Review and confirm pending appointment requests promptly to give patients timely care.</p>
          </div>
        </div>
      </div>
<NextStepBanner
  icon="📅"
  title="Review today's appointments"
  desc="Confirm pending requests, mark consultations complete and write prescriptions."
  btnLabel="View Appointments"
  btnPath="/doctor-appointments"
  btnSecondaryLabel="Update Profile"
  btnSecondaryPath="/edit-profile"
  color="blue"
/>
    </Layout>
  );
}
