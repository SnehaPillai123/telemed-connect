import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: fullName });
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid, email, displayName: fullName,
        role, preferredLanguage: language, createdAt: serverTimestamp()
      });
      if (role === "doctor") {
        await setDoc(doc(db, "doctors", result.user.uid), {
          userId: result.user.uid, fullName, email,
          specialization: "", consultationFee: "", experience: "",
          rating: 4.5, bio: "", availability: {}, createdAt: serverTimestamp()
        });
      } else {
        await setDoc(doc(db, "patients", result.user.uid), {
          userId: result.user.uid, fullName, email,
          phone: "", address: "", bloodGroup: "", dateOfBirth: "",
          allergies: "", medications: "", medicalHistory: "", createdAt: serverTimestamp()
        });
      }
      toast.success("Account created successfully!");
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } catch (err) {
      toast.error(err.message.includes("email-already-in-use") ? "Email already registered" : "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .input-field { width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .input-field:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .input-field::placeholder { color: #9ca3af; }
        .primary-btn { width: 100%; padding: 12px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: Inter, sans-serif; }
        .primary-btn:hover { background: #0f766e; }
        .primary-btn:disabled { background: #5eead4; cursor: not-allowed; }
        .role-card { flex: 1; padding: 16px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; background: white; }
        .role-card.active { border-color: #0d9488; background: #f0fdfa; }
        .role-card:hover { border-color: #0d9488; }
        label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 5px; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #0d9488; }
        .step-dot.inactive { background: #d1d5db; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', minHeight: '100vh' }}>

        {/* LEFT PANEL */}
        <div style={{ background: '#f0fdfa', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #ccfbf1' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#134e4a' }}>TeleMed Connect</p>
              <p style={{ fontSize: 11, color: '#0d9488', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Healthcare Platform</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: '#134e4a', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Join thousands<br/>
              <span style={{ color: '#0d9488' }}>getting better care.</span>
            </h1>
            <p style={{ fontSize: 15, color: '#5f9ea0', lineHeight: 1.75, marginBottom: 36 }}>
              Whether you're a patient looking for the right doctor, or a doctor ready to help patients — TeleMed Connect is built for you.
            </p>

            {/* Patient vs Doctor info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: '1px solid #ccfbf1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#134e4a' }}>For Patients</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Book appointments with verified doctors', 'AI symptom checker & health tracking', 'View prescriptions & order medicines'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <p style={{ fontSize: 13, color: '#374151' }}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: '1px solid #ccfbf1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#134e4a' }}>For Doctors</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Manage appointments & patient records', 'Write digital prescriptions instantly', 'Set your availability & consultation fees'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <p style={{ fontSize: 13, color: '#374151' }}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[{ value: '500+', label: 'Verified Doctors' }, { value: '10K+', label: 'Patients Served' }, { value: '4.9 / 5', label: 'Average Rating' }].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 8, padding: '14px 10px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#0d9488', marginBottom: 3 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#0f766e' }}>© 2026 TeleMed Connect · All rights reserved</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 44px', background: 'white', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            <div style={{ width: 36, height: 3, background: '#0d9488', borderRadius: 4, marginBottom: 24 }}/>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.01em' }}>Create your account</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>Join TeleMed Connect — it only takes 2 minutes.</p>

            {/* Role selector */}
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>I am registering as a</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {[
                { value: 'patient', label: 'Patient', desc: 'Book consultations', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { value: 'doctor', label: 'Doctor', desc: 'Manage patients', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              ].map(r => (
                <div key={r.value} className={`role-card ${role === r.value ? 'active' : ''}`} onClick={() => setRole(r.value)}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: role === r.value ? '#ccfbf1' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path d={r.icon} stroke={role === r.value ? '#0d9488' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: role === r.value ? '#0d9488' : '#374151', marginBottom: 2 }}>{r.label}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{r.desc}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Full name</label>
                <input className="input-field" type="text" placeholder="Dr. Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div>
                <label>Email address</label>
                <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Password</label>
                <input className="input-field" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label>Preferred language</label>
                <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                  {['English','Hindi','Marathi','Tamil','Telugu','Kannada','Bengali','Gujarati'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <button className="primary-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Creating account..." : `Create ${role === 'doctor' ? 'Doctor' : 'Patient'} Account →`}
              </button>
            </form>

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <span style={{ color: '#0d9488', cursor: 'pointer' }}>Terms of Service</span>{' '}and{' '}
              <span style={{ color: '#0d9488', cursor: 'pointer' }}>Privacy Policy</span>
            </p>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}