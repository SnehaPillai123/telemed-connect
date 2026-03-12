import { useState, useEffect } from "react";
import { doc, addDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Prescription() {
  const { appointmentId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "appointments", appointmentId));
      if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() });
    };
    fetch();
  }, [appointmentId]);

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => {
    const updated = [...medicines];
    updated[i][field] = value;
    setMedicines(updated);
  };

  const getMedicineLink = (name) => {
    const encoded = encodeURIComponent(name);
    return {
      onemg: `https://www.1mg.com/search/all?name=${encoded}`,
      pharmEasy: `https://pharmeasy.in/search/all?name=${encoded}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Medicine Order: ${name}\nPlease find it here: https://www.1mg.com/search/all?name=${encoded}`)}`
    };
  };

  const handleSave = async () => {
    if (!diagnosis.trim()) return toast.error("Please enter a diagnosis");
    if (medicines.some(m => !m.name.trim())) return toast.error("Please fill all medicine names");
    setSaving(true);
    try {
      const medicinesWithLinks = medicines.map(m => ({
        ...m,
        onemgLink: getMedicineLink(m.name).onemg,
        pharmEasyLink: getMedicineLink(m.name).pharmEasy,
      }));
      await addDoc(collection(db, "prescriptions"), {
        appointmentId,
        doctorId: user.uid,
        doctorName: user.displayName,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        diagnosis,
        notes,
        medicines: medicinesWithLinks,
        createdAt: serverTimestamp()
      });
      toast.success("Prescription saved successfully");
      navigate("/doctor-dashboard");
    } catch (err) {
      toast.error("Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .input-field { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #0f172a; background: #f8fafc; outline: none; transition: all 0.2s; appearance: none; }
        .input-field:focus { border-color: #0d9488; background: white; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .primary-btn { padding: 13px 32px; background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .primary-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .primary-btn:disabled { opacity: 0.6; transform: none; }
        .secondary-btn { padding: 11px 20px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .secondary-btn:hover { border-color: #94a3b8; }
        .remove-btn { padding: 8px 14px; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .remove-btn:hover { background: #fee2e2; }
        .order-link { display: inline-flex; align-items: center; gap: 6px; padding: '6px 12px'; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s; padding: 6px 12px; }
        label { font-size: 12px; font-weight: 500; color: #374151; display: block; margin-bottom: 5px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0284c7 100%)', padding: '40px 48px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Doctor Tools</p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 34, fontWeight: 400 }}>Write Prescription</h1>
            {appointment && (
              <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 8 }}>
                For {appointment.patientName} — {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Diagnosis */}
          <div className="card">
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              Diagnosis & Notes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label>Primary diagnosis</label>
                <input className="input-field" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Viral fever..."/>
              </div>
              <div>
                <label>Doctor's notes (optional)</label>
                <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Additional observations or instructions for the patient..."
                  rows={3} style={{ resize: 'vertical' }}/>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Medicines</p>
              <button className="secondary-btn" onClick={addMedicine}>+ Add Medicine</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {medicines.map((med, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Medicine {i + 1}</p>
                    {medicines.length > 1 && (
                      <button className="remove-btn" onClick={() => removeMedicine(i)}>Remove</button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label>Medicine name</label>
                      <input className="input-field" value={med.name} onChange={e => updateMedicine(i, "name", e.target.value)}
                        placeholder="e.g. Paracetamol 500mg"/>
                    </div>
                    <div>
                      <label>Dosage</label>
                      <input className="input-field" value={med.dosage} onChange={e => updateMedicine(i, "dosage", e.target.value)}
                        placeholder="500mg"/>
                    </div>
                    <div>
                      <label>Frequency</label>
                      <select className="input-field" value={med.frequency} onChange={e => updateMedicine(i, "frequency", e.target.value)}>
                        <option value="">Select</option>
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>Four times daily</option>
                        <option>As needed</option>
                        <option>At bedtime</option>
                      </select>
                    </div>
                    <div>
                      <label>Duration</label>
                      <select className="input-field" value={med.duration} onChange={e => updateMedicine(i, "duration", e.target.value)}>
                        <option value="">Select</option>
                        <option>3 days</option>
                        <option>5 days</option>
                        <option>7 days</option>
                        <option>10 days</option>
                        <option>14 days</option>
                        <option>1 month</option>
                        <option>3 months</option>
                        <option>Ongoing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label>Special instructions</label>
                    <input className="input-field" value={med.instructions} onChange={e => updateMedicine(i, "instructions", e.target.value)}
                      placeholder="e.g. Take after meals, avoid alcohol..."/>
                  </div>

                  {/* Order Links — show when medicine name is filled */}
                  {med.name.trim() && (
                    <div style={{ marginTop: 14, padding: '12px 16px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                        Order {med.name} online
                      </p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <a href={getMedicineLink(med.name).onemg} target="_blank" rel="noreferrer"
                          className="order-link" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5"/></svg>
                          Order on 1mg
                        </a>
                        <a href={getMedicineLink(med.name).pharmEasy} target="_blank" rel="noreferrer"
                          className="order-link" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5"/></svg>
                          Order on PharmEasy
                        </a>
                        <a href={getMedicineLink(med.name).whatsapp} target="_blank" rel="noreferrer"
                          className="order-link" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.886a.5.5 0 00.609.609l6.031-1.471A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.504-5.235-1.385l-.375-.217-3.893.949.969-3.893-.217-.375A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                          Share on WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="secondary-btn" onClick={() => navigate("/doctor-dashboard")}>Cancel</button>
            <button className="primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}