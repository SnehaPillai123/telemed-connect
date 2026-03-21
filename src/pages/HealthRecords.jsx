import { useState } from "react";
import PatientSidebar from "../components/PatientSidebar";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date().getDay();
const todayIdx = today === 0 ? 6 : today - 1;

const SAMPLE_MEDS = [
  { id: 1, name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Twice daily', times: ['8:00 AM', '8:00 PM'], taken: [true, true, true, true, false, false, false], color: '#0d9488' },
  { id: 2, name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly', times: ['9:00 AM'], taken: [false, false, false, false, false, false, false], color: '#2563eb' },
  { id: 3, name: 'Metformin 500mg', dosage: '500mg', frequency: 'Three times daily', times: ['7:00 AM', '1:00 PM', '7:00 PM'], taken: [true, true, true, false, false, false, false], color: '#7c3aed' },
];

export default function MedicationTracker() {
  const [meds, setMeds] = useState(SAMPLE_MEDS);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'Once daily', time: '8:00 AM' });

  const toggleTaken = (medId, dayIdx) => {
    setMeds(prev => prev.map(m => m.id === medId ? {
      ...m, taken: m.taken.map((t, i) => i === dayIdx ? !t : t)
    } : m));
  };

  const addMed = () => {
    if (!newMed.name.trim()) return;
    setMeds(prev => [...prev, {
      id: Date.now(), name: newMed.name, dosage: newMed.dosage,
      frequency: newMed.frequency, times: [newMed.time],
      taken: [false, false, false, false, false, false, false],
      color: '#0d9488'
    }]);
    setNewMed({ name: '', dosage: '', frequency: 'Once daily', time: '8:00 AM' });
    setShowAdd(false);
  };

  const todayTaken = meds.filter(m => m.taken[todayIdx]).length;
  const todayTotal = meds.length;
  const adherence = todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .layout { display: flex; min-height: 100vh; background: #f9fafb; }
        .main { margin-left: 250px; flex: 1; }
        .med-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; margin-bottom: 12px; }
        .med-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.06); }
        .day-btn { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-size: 11px; font-weight: 600; color: #6b7280; font-family: Inter, sans-serif; flex-direction: column; gap: 2px; }
        .day-btn.taken { background: #0d9488; border-color: #0d9488; color: white; }
        .day-btn.today { border-color: #0d9488; color: #0d9488; }
        .day-btn.today.taken { background: #0d9488; color: white; }
        .form-input { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; color: #111827; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <div className="layout">
        <PatientSidebar />
        <main className="main">
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Health Tools</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Medication Tracker</h1>
            </div>
            <button onClick={() => setShowAdd(!showAdd)}
              style={{ padding: '9px 18px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              + Add Medication
            </button>
          </header>

          <div style={{ padding: '28px 32px' }}>

            {/* Add form */}
            {showAdd && (
              <div className="fade-in" style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Add New Medication</p>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Medicine Name</label>
                    <input className="form-input" placeholder="e.g. Paracetamol" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Dosage</label>
                    <input className="form-input" placeholder="500mg" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Frequency</label>
                    <select className="form-input" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Once weekly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Time</label>
                    <input className="form-input" type="time" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={addMed} style={{ padding: '9px 20px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Add Medication
                  </button>
                  <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

              {/* Medications list */}
              <div>
                {/* Week header */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, paddingLeft: 200 }}>
                  {DAYS.map((d, i) => (
                    <div key={i} style={{ width: 36, textAlign: 'center', fontSize: 11, fontWeight: i === todayIdx ? 700 : 500, color: i === todayIdx ? '#0d9488' : '#9ca3af' }}>{d}</div>
                  ))}
                </div>

                {meds.map((med, mi) => (
                  <div key={med.id} className="med-card fade-in" style={{ animationDelay: `${mi*0.06}s`, opacity: 0 }}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 180, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: med.color, flexShrink: 0 }}/>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{med.name}</p>
                        </div>
                        <p style={{ fontSize: 11, color: '#6b7280', paddingLeft: 20 }}>{med.frequency}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {DAYS.map((d, i) => (
                          <button key={i} className={`day-btn ${med.taken[i] ? 'taken' : ''} ${i === todayIdx ? 'today' : ''}`}
                            onClick={() => toggleTaken(med.id, i)}
                            aria-label={`${med.taken[i] ? 'Mark as not taken' : 'Mark as taken'} on ${d}`}
                            aria-pressed={med.taken[i]}>
                            {med.taken[i] ? (
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : <span style={{ fontSize: 10 }}>{d[0]}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Today's adherence */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Today's Adherence</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 100, height: 100 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#0d9488" strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - adherence / 100)}`}
                          strokeLinecap="round"/>
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#0d9488', lineHeight: 1 }}>{adherence}%</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>taken</p>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                    {todayTaken} of {todayTotal} medications taken today
                  </p>
                </div>

                {/* Today's schedule */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Today's Schedule</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {meds.map((med, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: med.taken[todayIdx] ? '#f0fdfa' : '#f9fafb', borderRadius: 8, border: `1px solid ${med.taken[todayIdx] ? '#ccfbf1' : '#f3f4f6'}` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: med.taken[todayIdx] ? '#0d9488' : '#d1d5db', flexShrink: 0 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{med.name}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af' }}>{med.times.join(', ')}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: med.taken[todayIdx] ? '#0d9488' : '#9ca3af' }}>
                          {med.taken[todayIdx] ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
