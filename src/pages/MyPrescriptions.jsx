import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const todayIdx = new Date().getDay()===0?6:new Date().getDay()-1;
const SAMPLE_MEDS = [
  { id:1, name:'Paracetamol 500mg', frequency:'Twice daily', times:['8:00 AM','8:00 PM'], taken:[true,true,true,true,false,false,false], color:'#0d9488' },
  { id:2, name:'Vitamin D3', frequency:'Once weekly', times:['9:00 AM'], taken:[false,false,false,false,false,false,false], color:'#2563eb' },
  { id:3, name:'Metformin 500mg', frequency:'Three times daily', times:['7:00 AM','1:00 PM','7:00 PM'], taken:[true,true,true,false,false,false,false], color:'#7c3aed' },
];

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [meds, setMeds] = useState(SAMPLE_MEDS);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name:'', frequency:'Once daily', time:'08:00' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        data.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
        setPrescriptions(data);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const toggleTaken = (medId, dayIdx) => {
    setMeds(prev => prev.map(m => m.id===medId ? { ...m, taken:m.taken.map((t,i)=>i===dayIdx?!t:t) } : m));
  };

  const addMed = () => {
    if (!newMed.name.trim()) return;
    setMeds(prev => [...prev, { id:Date.now(), name:newMed.name, frequency:newMed.frequency, times:[newMed.time], taken:[false,false,false,false,false,false,false], color:'#0d9488' }]);
    setNewMed({ name:'', frequency:'Once daily', time:'08:00' });
    setShowAdd(false);
  };

  const todayTaken = meds.filter(m=>m.taken[todayIdx]).length;
  const adherence = meds.length>0 ? Math.round((todayTaken/meds.length)*100) : 0;

  const getMedLink = (name) => ({
    onemg: `https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`,
    pharmEasy: `https://pharmeasy.in/search/all?name=${encodeURIComponent(name)}`,
  });

  return (
    <Layout title="Prescriptions & Medications" subtitle="Patient Portal">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .rx-card { background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; transition:all 0.2s; margin-bottom:10px; }
        .rx-card:hover { border-color:#0d9488; box-shadow:0 4px 14px rgba(13,148,136,0.07); }
        .rx-header { padding:16px 18px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
        .rx-header:hover { background:#f9fafb; }
        .order-link { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:7px; font-size:12px; font-weight:600; text-decoration:none; }
        .med-card { background:white; border-radius:10px; border:1px solid #e5e7eb; padding:14px 16px; margin-bottom:8px; display:flex; align-items:center; gap:14px; transition:all 0.2s; }
        .med-card:hover { border-color:#0d9488; }
        .day-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #e5e7eb; background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; font-family:Inter,sans-serif; }
        .day-btn.taken { background:#0d9488; border-color:#0d9488; }
        .day-btn.today-day { border-color:#0d9488; }
        .form-input { width:100%; padding:10px 12px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:13px; color:#111827; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; background:white; }
        .form-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
      `}</style>

      {/* Stats row */}
      <div className="grid-4col" style={{ marginBottom:20 }}>
        {[
          { l:'Prescriptions', v:prescriptions.length, c:'#0d9488', bg:'#f0fdfa' },
          { l:'Medicines Tracked', v:meds.length, c:'#2563eb', bg:'#eff6ff' },
          { l:"Today's Adherence", v:`${adherence}%`, c:'#16a34a', bg:'#f0fdf4' },
          { l:'Taken Today', v:`${todayTaken}/${meds.length}`, c:'#d97706', bg:'#fffbeb' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:10, padding:'16px', border:'1px solid #e5e7eb', textAlign:'center' }}>
            <p style={{ fontSize:24, fontWeight:800, color:s.c, lineHeight:1, marginBottom:4 }}>{loading&&i===0?'—':s.v}</p>
            <p style={{ fontSize:12, color:'#6b7280' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab==='prescriptions'?'active':''}`} onClick={() => setActiveTab('prescriptions')}>
          💊 Prescriptions ({prescriptions.length})
        </button>
        <button className={`tab-btn ${activeTab==='tracker'?'active':''}`} onClick={() => setActiveTab('tracker')}>
          📅 Medication Tracker
        </button>
      </div>

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <div>
          {loading && <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><div style={{ width:30, height:30, border:'3px solid #e5e7eb', borderTopColor:'#0d9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/></div>}
          {!loading && prescriptions.length===0 && (
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'48px', textAlign:'center' }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" style={{ margin:'0 auto 14px', display:'block' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:6 }}>No prescriptions yet</p>
              <p style={{ fontSize:13, color:'#9ca3af' }}>Prescriptions will appear here after completed consultations.</p>
            </div>
          )}
          {prescriptions.map((rx, idx) => (
            <article key={rx.id} className="rx-card fade-in" style={{ animationDelay:`${idx*0.06}s`, opacity:0 }}>
              <div className="rx-header" onClick={() => setExpanded(expanded===rx.id?null:rx.id)}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="19" height="19" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2 }}>{rx.diagnosis}</p>
                    <p style={{ fontSize:12, color:'#6b7280' }}>Dr. {rx.doctorName} · {rx.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})||'Recently'}</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'#0d9488', background:'#f0fdfa', padding:'3px 12px', borderRadius:20, border:'1px solid #ccfbf1' }}>{rx.medicines?.length} med{rx.medicines?.length!==1?'s':''}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ transition:'transform 0.2s', transform:expanded===rx.id?'rotate(180deg)':'none' }}>
                    <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {expanded===rx.id && (
                <div style={{ padding:'0 18px 18px', borderTop:'1px solid #f3f4f6' }}>
                  {rx.notes && (
                    <div style={{ background:'#f9fafb', borderRadius:8, padding:'12px 14px', margin:'14px 0', borderLeft:'3px solid #0d9488' }}>
                      <p style={{ fontSize:12, fontWeight:600, color:'#0d9488', marginBottom:3 }}>Doctor's Notes</p>
                      <p style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{rx.notes}</p>
                    </div>
                  )}
                  <p style={{ fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em', margin:'14px 0 10px' }}>Medicines</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {rx.medicines?.map((med,i) => (
                      <div key={i} style={{ border:'1px solid #e5e7eb', borderRadius:9, padding:14 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:8 }}>{med.name}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                          {med.dosage && <span style={{ fontSize:11, color:'#374151', background:'#f3f4f6', padding:'3px 9px', borderRadius:20 }}>{med.dosage}</span>}
                          {med.frequency && <span style={{ fontSize:11, color:'#374151', background:'#f3f4f6', padding:'3px 9px', borderRadius:20 }}>{med.frequency}</span>}
                          {med.duration && <span style={{ fontSize:11, color:'#374151', background:'#f3f4f6', padding:'3px 9px', borderRadius:20 }}>{med.duration}</span>}
                        </div>
                        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                          <a href={getMedLink(med.name).onemg} target="_blank" rel="noreferrer" className="order-link" style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa' }}>Order on 1mg</a>
                          <a href={getMedLink(med.name).pharmEasy} target="_blank" rel="noreferrer" className="order-link" style={{ background:'#f0fdfa', color:'#0d9488', border:'1px solid #ccfbf1' }}>PharmEasy</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* MEDICATION TRACKER TAB */}
      {activeTab === 'tracker' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#111827' }}>Weekly Medication Tracker</p>
            <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 16px', background:'#0d9488', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              + Add Medication
            </button>
          </div>

          {showAdd && (
            <div className="fade-in" style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'20px', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Add New Medication</p>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Medicine Name</label><input className="form-input" placeholder="e.g. Paracetamol 500mg" value={newMed.name} onChange={e=>setNewMed({...newMed,name:e.target.value})}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Frequency</label>
                  <select className="form-input" value={newMed.frequency} onChange={e=>setNewMed({...newMed,frequency:e.target.value})}>
                    <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Once weekly</option>
                  </select>
                </div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Time</label><input className="form-input" type="time" value={newMed.time} onChange={e=>setNewMed({...newMed,time:e.target.value})}/></div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={addMed} style={{ padding:'9px 18px', background:'#0d9488', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Add</button>
                <button onClick={()=>setShowAdd(false)} style={{ padding:'9px 18px', background:'white', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:20, alignItems:'start' }}>
            <div>
              {/* Day headers */}
              <div style={{ display:'flex', alignItems:'center', marginBottom:10, paddingLeft:4 }}>
                <div style={{ width:190, flexShrink:0 }}/>
                <div style={{ display:'flex', gap:7 }}>
                  {DAYS.map((d,i) => (
                    <div key={i} style={{ width:34, textAlign:'center', fontSize:11, fontWeight:i===todayIdx?700:500, color:i===todayIdx?'#0d9488':'#9ca3af' }}>{d}</div>
                  ))}
                </div>
              </div>
              {meds.map((med,mi) => (
                <div key={med.id} className="med-card fade-in" style={{ animationDelay:`${mi*0.05}s`, opacity:0 }}>
                  <div style={{ width:190, flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:med.color, flexShrink:0 }}/>
                      <p style={{ fontSize:13, fontWeight:700, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{med.name}</p>
                    </div>
                    <p style={{ fontSize:11, color:'#9ca3af', paddingLeft:16 }}>{med.frequency}</p>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    {DAYS.map((d,i) => (
                      <button key={i} className={`day-btn ${med.taken[i]?'taken':''} ${i===todayIdx?'today-day':''}`}
                        onClick={() => toggleTaken(med.id,i)} title={`${d} - ${med.taken[i]?'Taken':'Not taken'}`}>
                        {med.taken[i]
                          ? <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <span style={{ fontSize:9, color:i===todayIdx?'#0d9488':'#d1d5db', fontWeight:600 }}>{d[0]}</span>
                        }
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Adherence ring */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'18px', textAlign:'center' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Today's Adherence</p>
                <div style={{ position:'relative', width:90, height:90, margin:'0 auto 12px' }}>
                  <svg viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0d9488" strokeWidth="10"
                      strokeDasharray={`${2*Math.PI*40}`} strokeDashoffset={`${2*Math.PI*40*(1-adherence/100)}`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <p style={{ fontSize:18, fontWeight:800, color:'#0d9488', lineHeight:1 }}>{adherence}%</p>
                    <p style={{ fontSize:9, color:'#9ca3af', fontWeight:500 }}>taken</p>
                  </div>
                </div>
                <p style={{ fontSize:12, color:'#6b7280' }}>{todayTaken} of {meds.length} taken today</p>
              </div>

              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:12 }}>Today's Schedule</p>
                {meds.map((med,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 0', borderBottom:i<meds.length-1?'1px solid #f3f4f6':'none' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:med.taken[todayIdx]?'#0d9488':'#d1d5db', flexShrink:0 }}/>
                    <p style={{ fontSize:12, fontWeight:500, color:'#111827', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{med.name}</p>
                    <span style={{ fontSize:11, fontWeight:600, color:med.taken[todayIdx]?'#0d9488':'#9ca3af', flexShrink:0 }}>{med.taken[todayIdx]?'✓ Done':'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}