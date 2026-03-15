import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  pending:   { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  confirmed: { bg: '#f0fdfa', color: '#0d9488', label: 'Confirmed' },
  completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAppointments(data); setLoading(false);
    };
    fetch();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      toast.success("Appointment cancelled");
    } catch { toast.error("Failed to cancel"); }
  };

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);
  const counts = { all: appointments.length, pending: appointments.filter(a => a.status === "pending").length, confirmed: appointments.filter(a => a.status === "confirmed").length, completed: appointments.filter(a => a.status === "completed").length, cancelled: appointments.filter(a => a.status === "cancelled").length };

  return (
    <Layout title="My Appointments" subtitle="Patient Portal">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: white; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; display: inline-flex; align-items: center; gap: 5px; }
        .filter-btn:hover { border-color: #0d9488; color: #0d9488; }
        .filter-btn.active { background: #0d9488; border-color: #0d9488; color: white; }
        .apt-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 16px 18px; transition: all 0.2s; margin-bottom: 10px; }
        .apt-card:hover { border-color: #0d9488; box-shadow: 0 4px 14px rgba(13,148,136,0.07); }
      `}</style>

      {/* Stats + filters row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ k: 'all', l: 'All' }, { k: 'pending', l: 'Pending' }, { k: 'confirmed', l: 'Confirmed' }, { k: 'completed', l: 'Completed' }, { k: 'cancelled', l: 'Cancelled' }].map(f => (
            <button key={f.k} className={`filter-btn ${filter === f.k ? 'active' : ''}`} onClick={() => setFilter(f.k)}>
              {f.l}
              <span style={{ fontSize: 10, background: filter === f.k ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: filter === f.k ? 'white' : '#6b7280', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>{counts[f.k]}</span>
            </button>
          ))}
        </div>
        <Link to="/search-doctors" style={{ padding: '8px 16px', background: '#0d9488', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Book New
        </Link>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 30, height: 30, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No appointments found</p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{filter === 'all' ? 'Book your first consultation to get started.' : `No ${filter} appointments.`}</p>
        </div>
      )}

      {filtered.map((apt, i) => {
        const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
        return (
          <article key={apt.id} className="apt-card fade-in" style={{ animationDelay: `${i*0.04}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>{apt.doctorName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Dr. {apt.doctorName}</p>
                  <p style={{ fontSize: 12, color: '#0d9488', fontWeight: 500, marginBottom: 6 }}>{apt.doctorSpecialization}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>📅 {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span style={{ fontSize: 12, color: '#374151' }}>🕐 {apt.appointmentTime}</span>
                  </div>
                  {apt.reason && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{apt.reason}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 20 }}>{st.label}</span>
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button onClick={() => handleCancel(apt.id)} style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </Layout>
  );
}
