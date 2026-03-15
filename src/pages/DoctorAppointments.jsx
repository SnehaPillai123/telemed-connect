import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import DoctorSidebar from "../components/DoctorSidebar";
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
      setAppointments(data);
      setLoading(false);
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
  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .filter-btn { padding: 7px 16px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; display: inline-flex; align-items: center; gap: 6px; }
        .filter-btn:hover { border-color: #0d9488; color: #0d9488; }
        .filter-btn.active { background: #0d9488; border-color: #0d9488; color: white; }
        .apt-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; margin-bottom: 12px; }
        .apt-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); }
        .action-btn { padding: 7px 14px; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .btn-confirm { background: #f0fdfa; color: #0d9488; border: 1.5px solid #ccfbf1; }
        .btn-confirm:hover { background: #0d9488; color: white; }
        .btn-complete { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; }
        .btn-complete:hover { background: #16a34a; color: white; }
        .btn-decline { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
        .btn-decline:hover { background: #dc2626; color: white; }
        .btn-prescription { background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; }
        .btn-prescription:hover { background: #2563eb; color: white; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <DoctorSidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column' }}>

          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Doctor Portal</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Appointments</h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ l: 'Pending', v: counts.pending, c: '#d97706' }, { l: 'Confirmed', v: counts.confirmed, c: '#0d9488' }].map((s, i) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </header>

          <div style={{ padding: '28px 32px', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }].map(f => (
                <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                  {f.label}
                  <span style={{ fontSize: 11, background: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: filter === f.key ? 'white' : '#6b7280', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{counts[f.key]}</span>
                </button>
              ))}
            </div>

            {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>}

            {!loading && filtered.length === 0 && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No appointments found</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{filter === 'all' ? 'No appointments booked yet.' : `No ${filter} appointments.`}</p>
              </div>
            )}

            {filtered.map((apt, i) => {
              const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
              return (
                <article key={apt.id} className="apt-card fade-in" style={{ animationDelay: `${i*0.04}s`, opacity: 0 }}>
                  <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                          {apt.patientName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{apt.patientName}</p>
                          <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 20 }}>{st.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/></svg>
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/></svg>
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{apt.appointmentTime}</span>
                          </div>
                        </div>
                        {apt.reason && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}><strong>Reason:</strong> {apt.reason}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      {apt.status === 'pending' && <>
                        <button className="action-btn btn-confirm" onClick={() => updateStatus(apt.id, 'confirmed')}>Confirm</button>
                        <button className="action-btn btn-decline" onClick={() => updateStatus(apt.id, 'cancelled')}>Decline</button>
                      </>}
                      {apt.status === 'confirmed' && <button className="action-btn btn-complete" onClick={() => updateStatus(apt.id, 'completed')}>Mark Complete</button>}
                      {apt.status === 'completed' && <button className="action-btn btn-prescription" onClick={() => navigate(`/prescription/${apt.id}`)}>Write Prescription</button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}