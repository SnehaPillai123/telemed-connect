import NextStepBanner from "../components/NextStepBanner";import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  pending:   { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  confirmed: { bg: '#f0fdfa', color: '#0d9488', label: 'Confirmed' },
  completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAppointments(data); setLoading(false);
    };
    fetch();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch { toast.error("Failed to update"); }
  };

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);
  const counts = { all: appointments.length, pending: appointments.filter(a => a.status === "pending").length, confirmed: appointments.filter(a => a.status === "confirmed").length, completed: appointments.filter(a => a.status === "completed").length, cancelled: appointments.filter(a => a.status === "cancelled").length };

  return (
    <Layout title="Appointments" subtitle="Doctor Portal">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: white; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; display: inline-flex; align-items: center; gap: 5px; }
        .filter-btn:hover { border-color: #0d9488; color: #0d9488; }
        .filter-btn.active { background: #0d9488; border-color: #0d9488; color: white; }
        .apt-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 16px 18px; transition: all 0.2s; margin-bottom: 10px; }
        .apt-card:hover { border-color: #0d9488; box-shadow: 0 4px 14px rgba(13,148,136,0.07); }
        .action-btn { padding: 6px 12px; border: none; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
      `}</style>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { l: "Today's", v: appointments.filter(a => a.appointmentDate === new Date().toISOString().split("T")[0]).length, c: '#0d9488', bg: '#f0fdfa' },
          { l: 'Pending', v: counts.pending, c: '#d97706', bg: '#fffbeb' },
          { l: 'Total', v: counts.all, c: '#2563eb', bg: '#eff6ff' },
          { l: 'Completed', v: counts.completed, c: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.bg}` }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.c, lineHeight: 1, marginBottom: 3 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: s.c, fontWeight: 500, opacity: 0.8 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ k: 'all', l: 'All' }, { k: 'pending', l: 'Pending' }, { k: 'confirmed', l: 'Confirmed' }, { k: 'completed', l: 'Completed' }, { k: 'cancelled', l: 'Cancelled' }].map(f => (
          <button key={f.k} className={`filter-btn ${filter === f.k ? 'active' : ''}`} onClick={() => setFilter(f.k)}>
            {f.l}
            <span style={{ fontSize: 10, background: filter === f.k ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: filter === f.k ? 'white' : '#6b7280', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>{counts[f.k]}</span>
          </button>
        ))}
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 30, height: 30, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No appointments found</p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{filter === 'all' ? 'No appointments booked yet.' : `No ${filter} appointments.`}</p>
        </div>
      )}

      {filtered.map((apt, i) => {
        const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
        return (
          <article key={apt.id} className="apt-card fade-in" style={{ animationDelay: `${i*0.04}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{apt.patientName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{apt.patientName}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '2px 9px', borderRadius: 20 }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: apt.reason ? 6 : 0 }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>📅 {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span style={{ fontSize: 12, color: '#374151' }}>🕐 {apt.appointmentTime}</span>
                  </div>
                  {apt.reason && <p style={{ fontSize: 12, color: '#6b7280' }}>{apt.reason}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {apt.status === 'pending' && <>
                  <button className="action-btn" style={{ background: '#f0fdfa', color: '#0d9488', border: '1.5px solid #ccfbf1' }} onClick={() => updateStatus(apt.id, 'confirmed')}>Confirm</button>
                  <button className="action-btn" style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }} onClick={() => updateStatus(apt.id, 'cancelled')}>Decline</button>
                </>}
                {apt.status === 'confirmed' && <button className="action-btn" style={{ background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0' }} onClick={() => updateStatus(apt.id, 'completed')}>Complete</button>}
                {apt.status === 'completed' && <button className="action-btn" style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }} onClick={() => navigate(`/prescription/${apt.id}`)}>Prescribe</button>}
              </div>
            </div>
          </article>
        );
      })}
<NextStepBanner
  icon="🏠"
  title="All done for today?"
  desc="Head back to your dashboard to see your overall stats and upcoming schedule."
  btnLabel="Go to Dashboard"
  btnPath="/doctor-dashboard"
  btnSecondaryLabel="Update Profile"
  btnSecondaryPath="/edit-profile"
  color="teal"
/>
    </Layout>
  );
}
