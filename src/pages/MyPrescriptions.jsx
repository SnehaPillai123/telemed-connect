import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import PatientSidebar from "../components/PatientSidebar";

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPrescriptions(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const getMedicineLink = (name) => ({
    onemg: `https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`,
    pharmEasy: `https://pharmeasy.in/search/all?name=${encodeURIComponent(name)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Medicine: ${name}\nOrder: https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`)}`
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .rx-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; margin-bottom: 12px; }
        .rx-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); }
        .rx-header { padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.15s; }
        .rx-header:hover { background: #f9fafb; }
        .order-link { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <PatientSidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column' }}>

          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0 }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Patient Portal</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>My Prescriptions</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>View your prescriptions and order medicines online.</p>
          </header>

          <div style={{ padding: '28px 32px', flex: 1 }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              </div>
            )}
            {!loading && prescriptions.length === 0 && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No prescriptions yet</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Your prescriptions will appear here after completed consultations.</p>
              </div>
            )}
            {prescriptions.map((rx, idx) => (
              <article key={rx.id} className="rx-card fade-in" style={{ animationDelay: `${idx*0.06}s`, opacity: 0 }}>
                <div className="rx-header" onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{rx.diagnosis}</p>
                      <p style={{ fontSize: 13, color: '#6b7280' }}>Dr. {rx.doctorName} · {rx.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Recently'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '4px 12px', borderRadius: 20, border: '1px solid #ccfbf1' }}>
                      {rx.medicines?.length} medicine{rx.medicines?.length !== 1 ? 's' : ''}
                    </span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: expanded === rx.id ? 'rotate(180deg)' : 'none' }}>
                      <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                {expanded === rx.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>
                    {rx.notes && (
                      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', margin: '16px 0', borderLeft: '3px solid #0d9488' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', marginBottom: 4 }}>Doctor's Notes</p>
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{rx.notes}</p>
                      </div>
                    )}
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 12px' }}>Prescribed Medicines</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {rx.medicines?.map((med, i) => (
                        <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{med.name}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                            {med.dosage && <span style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>{med.dosage}</span>}
                            {med.frequency && <span style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>{med.frequency}</span>}
                            {med.duration && <span style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>{med.duration}</span>}
                          </div>
                          {med.instructions && <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Note: {med.instructions}</p>}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <a href={getMedicineLink(med.name).onemg} target="_blank" rel="noreferrer" className="order-link" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Order on 1mg</a>
                            <a href={getMedicineLink(med.name).pharmEasy} target="_blank" rel="noreferrer" className="order-link" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1' }}>Order on PharmEasy</a>
                            <a href={getMedicineLink(med.name).whatsapp} target="_blank" rel="noreferrer" className="order-link" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Share on WhatsApp</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
