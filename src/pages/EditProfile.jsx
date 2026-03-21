import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import PatientSidebar from "../components/PatientSidebar";
import DoctorSidebar from "../components/DoctorSidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SPECIALIZATIONS = ["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist", "ENT Specialist", "Pulmonologist", "Endocrinologist"];

export default function EditProfile() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", preferredLanguage: "English",
    bloodGroup: "", dateOfBirth: "", address: "", allergies: "", medications: "", medicalHistory: "",
    specialization: "", licenseNumber: "", experience: "", consultationFee: "", bio: "", availability: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const col = role === "doctor" ? "doctors" : "patients";
      const snap = await getDoc(doc(db, col, user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setForm(prev => ({
          ...prev, ...data,
          fullName: data.fullName || user.displayName || "",
          email: data.email || user.email || "",
        }));
      } else {
        setForm(prev => ({ ...prev, fullName: user.displayName || "", email: user.email || "" }));
      }
    };
    fetchProfile();
  }, [user, role]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.fullName.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: form.fullName });
      const col = role === "doctor" ? "doctors" : "patients";
      await updateDoc(doc(db, col, user.uid), { ...form, updatedAt: serverTimestamp() });
      toast.success("Profile updated successfully!");
    } catch (err) { toast.error("Failed to save: " + err.message); }
    finally { setSaving(false); }
  };

  const Sidebar = role === "doctor" ? DoctorSidebar : PatientSidebar;

  const tabs = role === "doctor"
    ? [{ id: "personal", label: "Personal Info" }, { id: "professional", label: "Professional" }, { id: "availability", label: "Availability" }]
    : [{ id: "personal", label: "Personal Info" }, { id: "medical", label: "Medical History" }];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; appearance: none; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .tab-btn { padding: 9px 20px; border-radius: 8px; border: 1.5px solid transparent; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; background: none; color: #6b7280; }
        .tab-btn:hover { background: #f0fdfa; color: #0d9488; }
        .tab-btn.active { background: #0d9488; color: white; border-color: #0d9488; }
        label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; }
        .save-btn { padding: 11px 28px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; }
        .save-btn:hover { background: #0f766e; }
        .save-btn:disabled { background: #5eead4; cursor: not-allowed; }
        .cancel-btn { padding: 11px 24px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; }
        .cancel-btn:hover { border-color: #0d9488; color: #0d9488; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <Sidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column' }}>

          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Account</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                {role === "doctor" ? "Doctor Profile" : "Health Profile"}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </header>

          <div style={{ padding: '28px 32px', flex: 1 }}>

            {/* Profile card */}
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {form.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{form.fullName || "Your Name"}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{form.email} · <span style={{ color: '#0d9488', fontWeight: 600, textTransform: 'capitalize' }}>{role}</span></p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {tabs.map(t => (
                <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Personal Info tab */}
            {activeTab === "personal" && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Personal Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label>Full Name *</label>
                    <input className="form-input" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} placeholder="Your full name"/>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <input className="form-input" value={form.email} disabled style={{ background: '#f9fafb', color: '#9ca3af' }}/>
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <input className="form-input" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+91 9876543210"/>
                  </div>
                  <div>
                    <label>Preferred Language</label>
                    <select className="form-input" value={form.preferredLanguage} onChange={e => handleChange("preferredLanguage", e.target.value)}>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  {role === "patient" && <>
                    <div>
                      <label>Date of Birth</label>
                      <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => handleChange("dateOfBirth", e.target.value)}/>
                    </div>
                    <div>
                      <label>Blood Group</label>
                      <select className="form-input" value={form.bloodGroup} onChange={e => handleChange("bloodGroup", e.target.value)}>
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </>}
                </div>
                <div>
                  <label>Address</label>
                  <textarea className="form-input" value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="Your address..." rows={3} style={{ resize: 'vertical' }}/>
                </div>
              </div>
            )}

            {/* Medical History tab (patient) */}
            {activeTab === "medical" && role === "patient" && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Medical History</p>
                <div>
                  <label>Known Allergies</label>
                  <textarea className="form-input" value={form.allergies} onChange={e => handleChange("allergies", e.target.value)} placeholder="e.g. Penicillin, Dust, Pollen..." rows={3} style={{ resize: 'vertical' }}/>
                </div>
                <div>
                  <label>Current Medications</label>
                  <textarea className="form-input" value={form.medications} onChange={e => handleChange("medications", e.target.value)} placeholder="e.g. Metformin 500mg twice daily..." rows={3} style={{ resize: 'vertical' }}/>
                </div>
                <div>
                  <label>Medical History</label>
                  <textarea className="form-input" value={form.medicalHistory} onChange={e => handleChange("medicalHistory", e.target.value)} placeholder="e.g. Diabetes Type 2 (diagnosed 2018), Hypertension..." rows={4} style={{ resize: 'vertical' }}/>
                </div>
              </div>
            )}

            {/* Professional tab (doctor) */}
            {activeTab === "professional" && role === "doctor" && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Professional Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label>Specialization</label>
                    <select className="form-input" value={form.specialization} onChange={e => handleChange("specialization", e.target.value)}>
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>License Number</label>
                    <input className="form-input" value={form.licenseNumber} onChange={e => handleChange("licenseNumber", e.target.value)} placeholder="e.g. MH-12345"/>
                  </div>
                  <div>
                    <label>Years of Experience</label>
                    <input className="form-input" type="number" value={form.experience} onChange={e => handleChange("experience", e.target.value)} placeholder="e.g. 5" min="0"/>
                  </div>
                  <div>
                    <label>Consultation Fee (₹)</label>
                    <input className="form-input" type="number" value={form.consultationFee} onChange={e => handleChange("consultationFee", e.target.value)} placeholder="e.g. 500" min="0"/>
                  </div>
                </div>
                <div>
                  <label>Professional Bio</label>
                  <textarea className="form-input" value={form.bio} onChange={e => handleChange("bio", e.target.value)} placeholder="Brief description of your expertise and experience..." rows={4} style={{ resize: 'vertical' }}/>
                </div>
              </div>
            )}

            {/* Availability tab (doctor) */}
            {activeTab === "availability" && role === "doctor" && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '24px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6', marginBottom: 18 }}>Availability</p>
                <div>
                  <label>Working Hours & Days</label>
                  <textarea className="form-input" value={form.availability} onChange={e => handleChange("availability", e.target.value)} placeholder="e.g. Mon-Fri: 9AM-5PM, Sat: 9AM-1PM" rows={4} style={{ resize: 'vertical' }}/>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}