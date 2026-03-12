import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  confirmed: { bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
  completed: { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  cancelled: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
};

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.2s; }
        .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .filter-btn { padding: 8px 18px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: white; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; color: #64748b; }
        .filter-btn.active { background: #0f172a; border-color: #0f172a; color: white; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)', padding: '40px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              My Health
            </p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 34, fontWeight: 400, marginBottom: 24 }}>
              My Appointments
            </h1>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Total', value: counts.all, color: '#94a3b8' },
                { label: 'Pending', value: counts.pending, color: '#fb923c' },
                { label: 'Confirmed', value: counts.confirmed, color: '#0d9488' },
                { label: 'Completed', value: counts.completed, color: '#0284c7' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: s.color, fontSize: 22, fontWeight: 600 }}>{s.value}</p>
                  <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px' }}>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            {['all','pending','confirmed','completed','cancelled'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && <span style={{ marginLeft: 6, background: filter === f ? 'rgba(255,255,255,0.2)' : '#f1f5f9', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>{counts[f]}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No appointments yet</p>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Book your first consultation with a doctor</p>
              <button onClick={() => navigate('/search-doctors')}
                style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0d9488, #0284c7)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Find a Doctor
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(apt => {
                const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                return (
                  <div key={apt.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, alignItems: 'center' }}>

                    {/* Doctor Info */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                        {apt.doctorName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>Dr. {apt.doctorName}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{apt.doctorSpecialization}</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                        {new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{apt.appointmentTime}</p>
                    </div>

                    {/* Reason */}
                    <div>
                      {apt.reason
                        ? <p style={{ fontSize: 13, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{apt.reason}</p>
                        : <p style={{ fontSize: 13, color: '#cbd5e1' }}>No reason provided</p>
                      }
                    </div>

                    {/* Status */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
