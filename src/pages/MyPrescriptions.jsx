import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

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
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Medicine: ${name}\nOrder here: https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`)}`
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: all 0.2s; }
        .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .order-link { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .order-link:hover { transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)', padding: '40px 48px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Patient Portal</p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 34, fontWeight: 400, marginBottom: 8 }}>My Prescriptions</h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>View your prescriptions and order medicines online.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 48px' }}>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          )}

          {!loading && prescriptions.length === 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="30" height="30" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No prescriptions yet</p>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>Your prescriptions from doctors will appear here after completed consultations.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prescriptions.map((rx, idx) => (
              <div key={rx.id} className="card fade-up" style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: expanded === rx.id ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expanded === rx.id ? '#f8fafc' : 'white' }}
                  onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>{rx.diagnosis}</p>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Dr. {rx.doctorName} · {rx.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Recently'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '5px 12px', borderRadius: 20, border: '1px solid #99f6e4' }}>
                      {rx.medicines?.length} medicine{rx.medicines?.length !== 1 ? 's' : ''}
                    </span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: expanded === rx.id ? 'rotate(180deg)' : 'none' }}>
                      <path d="M6 9l6 6 6-6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded === rx.id && (
                  <div style={{ padding: '24px' }}>

                    {rx.notes && (
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 18px', marginBottom: 20, borderLeft: '3px solid #0d9488' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', marginBottom: 4 }}>Doctor's Notes</p>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{rx.notes}</p>
                      </div>
                    )}

                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prescribed Medicines</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {rx.medicines?.map((med, i) => (
                        <div key={i} style={{ border: '1px solid #f1f5f9', borderRadius: 12, padding: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{med.name}</p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {med.dosage && <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 }}>{med.dosage}</span>}
                                {med.frequency && <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 }}>{med.frequency}</span>}
                                {med.duration && <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 }}>{med.duration}</span>}
                              </div>
                            </div>
                          </div>

                          {med.instructions && (
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>📌 {med.instructions}</p>
                          )}

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <a href={getMedicineLink(med.name).onemg} target="_blank" rel="noreferrer"
                              className="order-link" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                              🏪 Order on 1mg
                            </a>
                            <a href={getMedicineLink(med.name).pharmEasy} target="_blank" rel="noreferrer"
                              className="order-link" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4' }}>
                              💊 Order on PharmEasy
                            </a>
                            <a href={getMedicineLink(med.name).whatsapp} target="_blank" rel="noreferrer"
                              className="order-link" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                              📲 Share on WhatsApp
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
