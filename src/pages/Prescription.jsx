import { useState, useEffect } from "react";
import { doc, addDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Prescription() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ name:"", dosage:"", frequency:"", duration:"", instructions:"" }]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "appointments", appointmentId));
      if (snap.exists()) setAppointment({ id:snap.id, ...snap.data() });
    };
    fetch();
  }, [appointmentId]);

  const addMedicine = () => setMedicines([...medicines, { name:"", dosage:"", frequency:"", duration:"", instructions:"" }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_,idx) => idx!==i));
  const updateMedicine = (i, field, value) => { const u=[...medicines]; u[i][field]=value; setMedicines(u); };

  const getMedicineLink = (name) => ({
    onemg: `https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`,
    pharmEasy: `https://pharmeasy.in/search/all?name=${encodeURIComponent(name)}`,
  });

  const handleSave = async () => {
    if (!diagnosis.trim()) return toast.error("Please enter a diagnosis");
    if (medicines.some(m => !m.name.trim())) return toast.error("Please fill all medicine names");
    setSaving(true);
    try {
      const medicinesWithLinks = medicines.map(m => ({
        ...m,
        onemgLink: getMedicineLink(m.name).onemg,
        pharmEasyLink: getMedicineLink(m.name).pharmEasy
      }));
      await addDoc(collection(db, "prescriptions"), {
        appointmentId, doctorId:user.uid, doctorName:user.displayName,
        patientId:appointment.patientId, patientName:appointment.patientName,
        diagnosis, notes, medicines:medicinesWithLinks, createdAt:serverTimestamp()
      });
      setShowSuccess(true);
    } catch {
      toast.error("Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────
  if (showSuccess) return (
    <Layout title="Prescription Saved!" subtitle="Doctor Tools">
      <style>{`
        @keyframes popIn { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .rx-success { animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .rx-next-btn { width:100%; padding:13px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; transition:all 0.2s; border:none; display:flex; align-items:center; justify-content:center; gap:8px; }
        .rx-next-btn:hover { transform:translateY(-1px); }
      `}</style>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 0" }}>
        <div className="rx-success" style={{ background:"white", borderRadius:20, border:"1px solid #e5e7eb", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#0d9488,#059669)", padding:"36px 32px", textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"3px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:6 }}>Prescription Saved!</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)" }}>
              For {appointment?.patientName}
            </p>
          </div>

          <div style={{ padding:"24px 28px" }}>

            {/* Summary */}
            <div style={{ background:"#f9fafb", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:12 }}>Prescription Summary</p>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Patient</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{appointment?.patientName}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Diagnosis</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#0d9488" }}>{diagnosis}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Medicines</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{medicines.length} prescribed</span>
              </div>
            </div>

            {/* Medicines list */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:10 }}>Medicines Prescribed</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {medicines.map((m,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#f0fdfa", borderRadius:9, border:"1px solid #ccfbf1",
                    animation:`fadeUp 0.3s ease ${i*0.07}s forwards`, opacity:0 }}>
                    <div style={{ width:30, height:30, borderRadius:7, background:"#0d9488", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{m.name}</p>
                      <p style={{ fontSize:11, color:"#6b7280" }}>{[m.dosage, m.frequency, m.duration].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div style={{ background:"#fffbeb", borderRadius:10, padding:"12px 16px", marginBottom:24, border:"1px solid #fde68a", display:"flex", gap:10 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
              <p style={{ fontSize:13, color:"#92400e", lineHeight:1.6 }}>
                The patient can now view this prescription in their account and order medicines directly.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button className="rx-next-btn" style={{ background:"#0d9488", color:"white" }}
                onClick={() => navigate("/doctor-appointments")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Back to Appointments
              </button>
              <button className="rx-next-btn" style={{ background:"white", color:"#374151", border:"1.5px solid #e5e7eb" }}
                onClick={() => navigate("/doctor-dashboard")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );

  // ── MAIN FORM ────────────────────────────────────────────
  return (
    <Layout title="Write Prescription" subtitle="Doctor Tools">
      <style>{`
        .form-input { width:100%; padding:11px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:13px; color:#111827; background:white; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; }
        .form-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
        .primary-btn { padding:11px 24px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif; }
        .primary-btn:hover { background:#0f766e; }
        .primary-btn:disabled { background:#5eead4; cursor:not-allowed; }
        .secondary-btn { padding:11px 20px; background:white; color:#374151; border:1.5px solid #e5e7eb; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; font-family:Inter,sans-serif; transition:all 0.2s; }
        .secondary-btn:hover { border-color:#0d9488; color:#0d9488; }
        .remove-btn { padding:6px 12px; background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; }
        label { font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px; }
        .order-link { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:7px; font-size:12px; font-weight:600; text-decoration:none; }
      `}</style>

      {appointment && (
        <div style={{ background:"#f0fdfa", borderRadius:10, padding:"14px 18px", marginBottom:20, border:"1px solid #ccfbf1", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:"#0d9488", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"white" }}>
              {appointment.patientName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
            </span>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827" }}>Writing prescription for {appointment.patientName}</p>
            <p style={{ fontSize:12, color:"#6b7280" }}>
              Appointment on {new Date(appointment.appointmentDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} · {appointment.appointmentTime}
            </p>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Diagnosis */}
        <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"24px" }}>
          <p style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:18, paddingBottom:14, borderBottom:"1px solid #f3f4f6" }}>Diagnosis & Notes</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label>Primary diagnosis</label>
              <input className="form-input" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension, Viral fever..."/>
            </div>
            <div>
              <label>Doctor's notes (optional)</label>
              <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional observations or instructions..." rows={3} style={{ resize:"vertical" }}/>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, paddingBottom:14, borderBottom:"1px solid #f3f4f6" }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827" }}>Medicines</p>
            <button className="secondary-btn" onClick={addMedicine}>+ Add Medicine</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {medicines.map((med,i) => (
              <div key={i} style={{ background:"#f9fafb", borderRadius:10, padding:"18px", border:"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#111827" }}>Medicine {i+1}</p>
                  {medicines.length > 1 && <button className="remove-btn" onClick={() => removeMedicine(i)}>Remove</button>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
                  <div><label>Medicine name</label><input className="form-input" value={med.name} onChange={e => updateMedicine(i,"name",e.target.value)} placeholder="e.g. Paracetamol 500mg"/></div>
                  <div><label>Dosage</label><input className="form-input" value={med.dosage} onChange={e => updateMedicine(i,"dosage",e.target.value)} placeholder="500mg"/></div>
                  <div>
                    <label>Frequency</label>
                    <select className="form-input" value={med.frequency} onChange={e => updateMedicine(i,"frequency",e.target.value)}>
                      <option value="">Select</option>
                      <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Four times daily</option><option>As needed</option><option>At bedtime</option>
                    </select>
                  </div>
                  <div>
                    <label>Duration</label>
                    <select className="form-input" value={med.duration} onChange={e => updateMedicine(i,"duration",e.target.value)}>
                      <option value="">Select</option>
                      <option>3 days</option><option>5 days</option><option>7 days</option><option>10 days</option><option>14 days</option><option>1 month</option><option>Ongoing</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label>Special instructions</label>
                  <input className="form-input" value={med.instructions} onChange={e => updateMedicine(i,"instructions",e.target.value)} placeholder="e.g. Take after meals..."/>
                </div>
                {med.name.trim() && (
                  <div style={{ padding:"10px 14px", background:"white", borderRadius:8, border:"1px solid #e5e7eb" }}>
                    <p style={{ fontSize:11, color:"#9ca3af", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Order online</p>
                    <div style={{ display:"flex", gap:8 }}>
                      <a href={getMedicineLink(med.name).onemg} target="_blank" rel="noreferrer" className="order-link" style={{ background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa" }}>Order on 1mg</a>
                      <a href={getMedicineLink(med.name).pharmEasy} target="_blank" rel="noreferrer" className="order-link" style={{ background:"#f0fdfa", color:"#0d9488", border:"1px solid #ccfbf1" }}>PharmEasy</a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
          <button className="secondary-btn" onClick={() => navigate("/doctor-appointments")}>Cancel</button>
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Prescription →"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
