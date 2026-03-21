import NextStepBanner from "../components/NextStepBanner";import { useState, useEffect } from "react";
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
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("appointments");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [aptSnap, rxSnap] = await Promise.all([
        getDocs(query(collection(db, "appointments"), where("patientId", "==", user.uid))),
        getDocs(query(collection(db, "prescriptions"), where("patientId", "==", user.uid))),
      ]);
      const apts = aptSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      apts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAppointments(apts);
      setPrescriptions(rxSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    };
    fetchAll();
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
  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  return (
    <Layout title="Appointments & Records" subtitle="Patient Portal">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .filter-chip { padding:6px 14px; border-radius:20px; border:1.5px solid #e5e7eb; background:white; font-size:12px; font-weight:500; color:#374151; cursor:pointer; transition:all 0.15s; font-family:Inter,sans-serif; display:inline-flex; align-items:center; gap:5px; }
        .filter-chip:hover { border-color:#0d9488; color:#0d9488; }
        .filter-chip.active { background:#0d9488; border-color:#0d9488; color:white; }
        .apt-card { background:white; border-radius:12px; border:1px solid #e5e7eb; padding:16px 18px; transition:all 0.2s; margin-bottom:10px; }
        .apt-card:hover { border-color:#0d9488; box-shadow:0 4px 14px rgba(13,148,136,0.07); }
        .rx-card { background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; transition:all 0.2s; margin-bottom:10px; }
        .rx-card:hover { border-color:#0d9488; box-shadow:0 4px 14px rgba(13,148,136,0.07); }
        .rx-header { padding:16px 18px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
        .rx-header:hover { background:#f9fafb; }
        .order-link { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:7px; font-size:12px; font-weight:600; text-decoration:none; }
      `}</style>

      {/* Summary stats */}
      <div className="grid-4col" style={{ marginBottom: 20 }}>
        {[
          { l: 'Total', v: counts.all, c: '#374151', bg: '#f9fafb' },
          { l: 'Upcoming', v: counts.pending + counts.confirmed, c: '#0d9488', bg: '#f0fdfa' },
          { l: 'Completed', v: counts.completed, c: '#16a34a', bg: '#f0fdf4' },
          { l: 'Prescriptions', v: prescriptions.length, c: '#2563eb', bg: '#eff6ff' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.c, lineHeight: 1, marginBottom: 4 }}>{loading ? '—' : s.v}</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📅 Appointments ({counts.all})
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          📋 Health Records
        </button>
      </div>

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ k:'all',l:'All' },{ k:'pending',l:'Pending' },{ k:'confirmed',l:'Confirmed' },{ k:'completed',l:'Completed' },{ k:'cancelled',l:'Cancelled' }].map(f => (
                <button key={f.k} className={`filter-chip ${filter===f.k?'active':''}`} onClick={() => setFilter(f.k)}>
                  {f.l}
                  <span style={{ fontSize:10, background: filter===f.k?'rgba(255,255,255,0.25)':'#f3f4f6', color: filter===f.k?'white':'#6b7280', padding:'1px 6px', borderRadius:20, fontWeight:600 }}>{counts[f.k]}</span>
                </button>
              ))}
            </div>
            <Link to="/search-doctors" style={{ padding:'8px 16px', background:'#0d9488', color:'white', borderRadius:8, fontSize:12, fontWeight:600, textDecoration:'none' }}>
              + Book New
            </Link>
          </div>

          {loading && <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><div style={{ width:30, height:30, border:'3px solid #e5e7eb', borderTopColor:'#0d9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/></div>}

          {!loading && filtered.length === 0 && (
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'48px', textAlign:'center' }}>
              <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:6 }}>No appointments found</p>
              <p style={{ fontSize:13, color:'#9ca3af' }}>{filter==='all'?'Book your first consultation to get started.':`No ${filter} appointments.`}</p>
            </div>
          )}

          {filtered.map((apt, i) => {
            const st = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
            return (
              <article key={apt.id} className="apt-card fade-in" style={{ animationDelay:`${i*0.04}s`, opacity:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ display:'flex', gap:12, flex:1, minWidth:0 }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#0d9488' }}>{apt.doctorName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2 }}>Dr. {apt.doctorName}</p>
                      <p style={{ fontSize:12, color:'#0d9488', fontWeight:500, marginBottom:6 }}>{apt.doctorSpecialization}</p>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <span style={{ fontSize:12, color:'#374151' }}>📅 {new Date(apt.appointmentDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span>
                        <span style={{ fontSize:12, color:'#374151' }}>🕐 {apt.appointmentTime}</span>
                      </div>
                      {apt.reason && <p style={{ fontSize:12, color:'#6b7280', marginTop:6 }}>{apt.reason}</p>}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:st.color, background:st.bg, padding:'4px 10px', borderRadius:20 }}>{st.label}</span>
                    {(apt.status==='pending'||apt.status==='confirmed') && (
                      <button onClick={() => handleCancel(apt.id)} style={{ padding:'6px 12px', background:'white', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancel</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* HEALTH RECORDS TAB */}
      {activeTab === 'history' && (
        <div>
          {loading && <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><div style={{ width:30, height:30, border:'3px solid #e5e7eb', borderTopColor:'#0d9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/></div>}

          {!loading && appointments.length === 0 && (
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'48px', textAlign:'center' }}>
              <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:6 }}>No health records yet</p>
              <p style={{ fontSize:13, color:'#9ca3af' }}>Your medical history will appear here after your first consultation.</p>
            </div>
          )}

          {/* Timeline */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:16 }}>Medical Timeline</p>
              {[...appointments.map(a=>({...a,_type:'appointment'})), ...prescriptions.map(r=>({...r,_type:'prescription'}))].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).map((item, i) => (
                <div className="fade-in" style={{ paddingBottom:20, position:'relative', animationDelay:`${i*0.05}s`, opacity:0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:item._type==='prescription'?'#eff6ff':'#f0fdfa', border:`1px solid ${item._type==='prescription'?'#bfdbfe':'#ccfbf1'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d={item._type==='prescription'?'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2':'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'} stroke={item._type==='prescription'?'#2563eb':'#0d9488'} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {i < 10 && <div style={{ width:2, flex:1, background:'#f3f4f6', minHeight:20 }}/>}
                  </div>
                  <div style={{ flex:1, background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px', marginBottom:4 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:10, fontWeight:700, color:item._type==='prescription'?'#2563eb':'#0d9488', textTransform:'uppercase', letterSpacing:'0.06em' }}>{item._type==='prescription'?'Prescription':'Appointment'}</span>
                        <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginTop:2 }}>
                          {item._type==='prescription'?item.diagnosis:`Dr. ${item.doctorName}`}
                        </p>
                      </div>
                      <span style={{ fontSize:11, color:'#9ca3af', flexShrink:0 }}>
                        {item.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||'Recent'}
                      </span>
                    </div>
                    <p style={{ fontSize:12, color:'#6b7280' }}>
                      {item._type==='prescription'?`Dr. ${item.doctorName} · ${item.medicines?.length||0} medicine(s)`:
                      `${item.doctorSpecialization||''} · ${item.appointmentDate||''} · `}
                      {item._type==='appointment' && <span style={{ color:STATUS_STYLE[item.status]?.color||'#6b7280', fontWeight:600 }}>{STATUS_STYLE[item.status]?.label}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'18px' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Health Summary</p>
                {[
                  { l:'Total Visits', v:appointments.length },
                  { l:'Completed', v:appointments.filter(a=>a.status==='completed').length },
                  { l:'Prescriptions', v:prescriptions.length },
                  { l:'Last Visit', v:appointments[0]?.appointmentDate||'—' },
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:i<3?'1px solid #f3f4f6':'none' }}>
                    <p style={{ fontSize:13, color:'#6b7280' }}>{s.l}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ background:'#f0fdfa', borderRadius:12, padding:'16px', border:'1px solid #ccfbf1', borderLeft:'4px solid #0d9488' }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#134e4a', marginBottom:5 }}>Tip</p>
                <p style={{ fontSize:12, color:'#374151', lineHeight:1.7 }}>Keep your health profile updated for better doctor recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      )}
<NextStepBanner
  icon="📋"
  title="Check your prescriptions"
  desc="View all your digital prescriptions and track your weekly medication schedule."
  btnLabel="View Prescriptions"
  btnPath="/my-prescriptions"
  btnSecondaryLabel="Find a Doctor"
  btnSecondaryPath="/search-doctors"
  color="blue"
/>
    </Layout>
  );
}