import { useState, useEffect } from "react";
import { doc, addDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import DoctorSidebar from "../components/DoctorSidebar";
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
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "appointments", appointmentId));
      if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() });
    };
    fetch();
  }, [appointmentId]);

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => { const updated = [...medicines]; updated[i][field] = value; setMedicines(updated); };

  const getMedicineLink = (name) => ({
    onemg: `https://www.1mg.com/search/all?name=${encodeURIComponent(name)}`,
    pharmEasy: `https://pharmeasy.in/search/all?name=${encodeURIComponent(name)}`,
  });

  const handleSave = async () => {
    if (!diagnosis.trim()) return toast.error("Please enter a diagnosis");
    if (medicines.some(m => !m.name.trim())) return toast.error("Please fill all medicine names");
    setSaving(true);
    try {
      const medicinesWithLinks = medicines.map(m => ({ ...m, onemgLink: getMedicineLink(m.name).onemg, pharmEasyLink: getMedicineLink(m.name).pharmEasy }));
      await addDoc(collection(db, "prescriptions"), {
        appointmentId, doctorId: user.uid, doctorName: user.displayName,
        patientId: appointment.patientId, patientName: appointment.patientName,
        diagnosis, notes, medicines: medicinesWithLinks, createdAt: serverTimestamp()
      });
      toast.success("Prescription saved successfully");
      navigate("/doctor-dashboard");
    } catch { toast.error("Failed to save prescription"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .primary-btn { padding: 11px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: Inter, sans-serif; }
        .primary-btn:hover { background: #0f766e; }
        .primary-btn:disabled { background: #5eead4; cursor: not-allowed; }
        .secondary-btn { padding: 11px 20px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; }
        .secondary-btn:hover { border-color: #0d9488; color: #0d9488; }
        .remove-btn { padding: 6px 12px; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: Inter, sans-serif; }
        label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; }
        .order-link { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; text-decoration: none; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <DoctorSidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column' }}>

          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0 }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Doctor Tools</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Write Prescription</h1>
            {appointment && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>For {appointment.patientName} — {new Date(appointment.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </header>

          <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Diagnosis */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Diagnosis & Notes</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label>Primary diagnosis</label>
                  <input className="form-input" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension, Viral fever..."/>
                </div>
                <div>
                  <label>Doctor's notes (optional)</label>
                  <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional observations or instructions..." rows={3} style={{ resize: 'vertical' }}/>
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Medicines</p>
                <button className="secondary-btn" onClick={addMedicine}>+ Add Medicine</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {medicines.map((med, i) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: '18px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Medicine {i+1}</p>
                      {medicines.length > 1 && <button className="remove-btn" onClick={() => removeMedicine(i)}>Remove</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div><label>Medicine name</label><input className="form-input" value={med.name} onChange={e => updateMedicine(i, "name", e.target.value)} placeholder="e.g. Paracetamol 500mg"/></div>
                      <div><label>Dosage</label><input className="form-input" value={med.dosage} onChange={e => updateMedicine(i, "dosage", e.target.value)} placeholder="500mg"/></div>
                      <div>
                        <label>Frequency</label>
                        <select className="form-input" value={med.frequency} onChange={e => updateMedicine(i, "frequency", e.target.value)}>
                          <option value="">Select</option>
                          <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Four times daily</option><option>As needed</option><option>At bedtime</option>
                        </select>
                      </div>
                      <div>
                        <label>Duration</label>
                        <select className="form-input" value={med.duration} onChange={e => updateMedicine(i, "duration", e.target.value)}>
                          <option value="">Select</option>
                          <option>3 days</option><option>5 days</option><option>7 days</option><option>10 days</option><option>14 days</option><option>1 month</option><option>Ongoing</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Special instructions</label>
                      <input className="form-input" value={med.instructions} onChange={e => updateMedicine(i, "instructions", e.target.value)} placeholder="e.g. Take after meals..."/>
                    </div>
                    {med.name.trim() && (
                      <div style={{ padding: '10px 14px', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Order {med.name} online</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a href={getMedicineLink(med.name).onemg} target="_blank" rel="noreferrer" className="order-link" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Order on 1mg</a>
                          <a href={getMedicineLink(med.name).pharmEasy} target="_blank" rel="noreferrer" className="order-link" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1' }}>Order on PharmEasy</a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => navigate("/doctor-dashboard")}>Cancel</button>
              <button className="primary-btn" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Prescription"}</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
