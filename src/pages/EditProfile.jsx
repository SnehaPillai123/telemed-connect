import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SPECIALIZATIONS = ["General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedic","Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist","Dentist","Oncologist"];
const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const LANGUAGES = ["English","Hindi","Marathi","Tamil","Telugu","Kannada","Bengali","Gujarati"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function EditProfile() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const col = role === "doctor" ? "doctors" : "patients";
      const snap = await getDoc(doc(db, col, user.uid));
      if (snap.exists()) setForm(snap.data());
      setLoading(false);
    };
    fetchProfile();
  }, [user, role]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const col = role === "doctor" ? "doctors" : "patients";
      await updateDoc(doc(db, col, user.uid), { ...form, updatedAt: serverTimestamp() });
      await updateDoc(doc(db, "users", user.uid), { displayName: form.fullName });
      await updateProfile(auth.currentUser, { displayName: form.fullName });
      toast.success("Profile updated successfully");
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const tabs = role === "doctor"
    ? [{ id: "personal", label: "Personal" }, { id: "professional", label: "Professional" }, { id: "availability", label: "Availability" }]
    : [{ id: "personal", label: "Personal" }, { id: "medical", label: "Medical Info" }];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .input-field { width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; transition: all 0.2s; appearance: none; }
        .input-field:focus { border-color: #0d9488; background: white; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .input-field:disabled { opacity: 0.5; cursor: not-allowed; }
        .primary-btn { padding: 13px 36px; background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .primary-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.3); }
        .primary-btn:disabled { opacity: 0.6; transform: none; }
        .secondary-btn { padding: 13px 24px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .secondary-btn:hover { border-color: #94a3b8; }
        .tab-btn { padding: 10px 20px; border: none; background: transparent; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.2s; color: #64748b; }
        .tab-btn.active { background: white; color: #0d9488; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .info-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        textarea.input-field { resize: vertical; min-height: 100px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)',
          padding: '40px 48px 0'
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Account Settings
            </p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 34, fontWeight: 400, marginBottom: 32 }}>
              Edit Profile
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
              {tabs.map(tab => (
                <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)} type="button"
                  style={{ color: activeTab === tab.id ? '#0d9488' : '#94a3b8' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>
          <form onSubmit={handleSave}>

            {/* PERSONAL TAB */}
            {activeTab === "personal" && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>

                {/* Left — Avatar Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="info-card" style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px', fontSize: 32, color: 'white', fontWeight: 600
                    }}>
                      {(form.fullName || user?.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{form.fullName || user?.displayName}</p>
                    <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>{role}</p>
                    <div style={{ marginTop: 16, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</p>
                    </div>
                  </div>

                  <div className="info-card">
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Profile Completion</p>
                    {[
                      { label: 'Name', done: !!form.fullName },
                      { label: 'Phone', done: !!form.phone },
                      { label: role === 'doctor' ? 'Specialization' : 'Blood Group', done: role === 'doctor' ? !!form.specialization : !!form.bloodGroup },
                      { label: role === 'doctor' ? 'Bio' : 'Address', done: role === 'doctor' ? !!form.bio : !!form.address },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                        <p style={{ fontSize: 13, color: '#64748b' }}>{item.label}</p>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${item.done ? '#0d9488' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.done && <svg width="10" height="10" fill="none" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="info-card">
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>Personal Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="field-group">
                        <label>Full name</label>
                        <input className="input-field" name="fullName" value={form.fullName || ""} onChange={handle} placeholder="Your full name" required/>
                      </div>
                      <div className="field-group">
                        <label>Phone number</label>
                        <input className="input-field" name="phone" value={form.phone || ""} onChange={handle} placeholder="+91 98765 43210"/>
                      </div>
                      <div className="field-group">
                        <label>Email address</label>
                        <input className="input-field" value={user?.email || ""} disabled/>
                      </div>
                      <div className="field-group">
                        <label>Preferred language</label>
                        <select className="input-field" name="preferredLanguage" value={form.preferredLanguage || "English"} onChange={handle}>
                          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      {role === "patient" && (
                        <>
                          <div className="field-group">
                            <label>Date of birth</label>
                            <input className="input-field" name="dateOfBirth" type="date" value={form.dateOfBirth || ""} onChange={handle}/>
                          </div>
                          <div className="field-group">
                            <label>Blood group</label>
                            <select className="input-field" name="bloodGroup" value={form.bloodGroup || ""} onChange={handle}>
                              <option value="">Select blood group</option>
                              {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Address</label>
                        <input className="input-field" name="address" value={form.address || ""} onChange={handle} placeholder="Your full address"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROFESSIONAL TAB (Doctor only) */}
            {activeTab === "professional" && role === "doctor" && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <div className="info-card" style={{ height: 'fit-content' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Why this matters</p>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
                    A complete professional profile helps patients find and trust you. Doctors with complete profiles get up to 3x more bookings.
                  </p>
                  <div style={{ marginTop: 20, padding: 16, background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1' }}>
                    <p style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>Pro tip</p>
                    <p style={{ fontSize: 12, color: '#0f766e', marginTop: 4, lineHeight: 1.6 }}>
                      Write a warm, personal bio. Patients respond better to doctors who sound human.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="info-card">
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>Professional Details</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="field-group">
                        <label>Specialization</label>
                        <select className="input-field" name="specialization" value={form.specialization || ""} onChange={handle}>
                          <option value="">Select specialization</option>
                          {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="field-group">
                        <label>License number</label>
                        <input className="input-field" name="licenseNumber" value={form.licenseNumber || ""} onChange={handle} placeholder="MCI-12345"/>
                      </div>
                      <div className="field-group">
                        <label>Consultation fee (INR)</label>
                        <input className="input-field" name="consultationFee" type="number" value={form.consultationFee || ""} onChange={handle} placeholder="500"/>
                      </div>
                      <div className="field-group">
                        <label>Years of experience</label>
                        <input className="input-field" name="experience" type="number" value={form.experience || ""} onChange={handle} placeholder="5"/>
                      </div>
                      <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Professional bio</label>
                        <textarea className="input-field" name="bio" value={form.bio || ""} onChange={handle}
                          placeholder="Tell patients about your expertise, approach to care, and what makes your practice unique..." rows={5}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AVAILABILITY TAB (Doctor only) */}
            {activeTab === "availability" && role === "doctor" && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <div className="info-card" style={{ height: 'fit-content' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Consultation Hours</p>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
                    Set which days you are available for consultations. Patients can only book appointments on your available days.
                  </p>
                </div>

                <div className="info-card">
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>Weekly Availability</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {DAYS.map(day => (
                      <div key={day} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', borderRadius: 10,
                        background: form.availability?.[day] ? '#f0fdfa' : '#f8fafc',
                        border: `1.5px solid ${form.availability?.[day] ? '#99f6e4' : '#f1f5f9'}`,
                        transition: 'all 0.2s'
                      }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: form.availability?.[day] ? '#0f172a' : '#64748b' }}>{day}</p>
                        <div style={{
                          width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                          background: form.availability?.[day] ? '#0d9488' : '#e2e8f0',
                          position: 'relative', transition: 'all 0.2s'
                        }} onClick={() => setForm({ ...form, availability: { ...form.availability, [day]: !form.availability?.[day] }})}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', background: 'white',
                            position: 'absolute', top: 3, transition: 'all 0.2s',
                            left: form.availability?.[day] ? 23 : 3,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                          }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MEDICAL TAB (Patient only) */}
            {activeTab === "medical" && role === "patient" && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <div className="info-card" style={{ height: 'fit-content' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Why this matters</p>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
                    Your medical information helps doctors provide better, safer care during consultations.
                  </p>
                  <div style={{ marginTop: 20, padding: 16, background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
                    <p style={{ fontSize: 12, color: '#c2410c', fontWeight: 600 }}>Privacy note</p>
                    <p style={{ fontSize: 12, color: '#9a3412', marginTop: 4, lineHeight: 1.6 }}>
                      This information is only shared with doctors you book consultations with.
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>Medical Information</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="field-group">
                      <label>Date of birth</label>
                      <input className="input-field" name="dateOfBirth" type="date" value={form.dateOfBirth || ""} onChange={handle}/>
                    </div>
                    <div className="field-group">
                      <label>Blood group</label>
                      <select className="input-field" name="bloodGroup" value={form.bloodGroup || ""} onChange={handle}>
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Known allergies</label>
                      <input className="input-field" name="allergies" value={form.allergies || ""} onChange={handle} placeholder="e.g. Penicillin, Peanuts (comma separated)"/>
                    </div>
                    <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Current medications</label>
                      <textarea className="input-field" name="medications" value={form.medications || ""} onChange={handle}
                        placeholder="List any medications you are currently taking..." rows={3}/>
                    </div>
                    <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Medical history</label>
                      <textarea className="input-field" name="medicalHistory" value={form.medicalHistory || ""} onChange={handle}
                        placeholder="Any past surgeries, chronic conditions, or relevant medical history..." rows={4}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'flex-end',
              marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0'
            }}>
              <button type="button" className="secondary-btn"
                onClick={() => navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard")}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
