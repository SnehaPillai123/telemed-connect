import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const redirectByRole = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    navigate(snap.data()?.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      await redirectByRole(result.user.uid);
    } catch {
      toast.error("Invalid email or password");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", uid), { uid, email: result.user.email, displayName: result.user.displayName, role: "patient", preferredLanguage: "en", createdAt: serverTimestamp() });
        navigate("/patient-dashboard");
      } else { await redirectByRole(uid); }
    } catch { toast.error("Google sign-in failed"); }
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
        .google-btn { width: 100%; padding: 11px; background: white; color: #374151; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: border 0.15s; font-family: Inter, sans-serif; }
        .google-btn:hover { border-color: #0d9488; }
        .feature-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
        .feature-icon { width: 32px; height: 32px; border-radius: 6px; background: #f0fdfa; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-box { background: white; border-radius: 8px; padding: 14px 10px; text-align: center; border: 1px solid #e5e7eb; }
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
              <p style={{ fontSize: 11, color: '#5eead4', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Healthcare Platform</p>
            </div>
          </div>

          {/* Main content */}
          <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ccfbf1', border: '1px solid #99f6e4', borderRadius: 50, padding: '5px 14px', marginBottom: 28, marginTop: 16 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488' }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f766e', letterSpacing: '0.04em' }}>TRUSTED BY 10,000+ PATIENTS</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: '#134e4a', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Your Health,<br/>
              <span style={{ color: '#0d9488' }}>Our Priority.</span>
            </h1>
            <p style={{ fontSize: 15, color: '#5f9ea0', lineHeight: 1.75, marginBottom: 32, maxWidth: 400 }}>
              Connect with verified doctors, manage your health records, get prescriptions — and reach emergency care with a single tap.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'AI-powered symptom analysis & specialist matching' },
                { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Emergency SOS with real-time location sharing' },
                { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'One-click medicine ordering from prescriptions' },
                { icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', label: 'Multilingual consultations in 8+ Indian languages' },
              ].map((f, i) => (
                <div key={i} className="feature-row">
                  <div className="feature-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d={f.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f.label}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { value: '500+', label: 'Verified Doctors' },
                { value: '10K+', label: 'Patients Served' },
                { value: '4.9 / 5', label: 'Average Rating' },
              ].map((s, i) => (
                <div key={i} className="stat-box">
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#0d9488', marginBottom: 3 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#0f766e' }}>© 2026 TeleMed Connect · All rights reserved</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 44px', background: 'white' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            <div style={{ width: 36, height: 3, background: '#0d9488', borderRadius: 4, marginBottom: 24 }}/>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.01em' }}>Sign in</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>Enter your credentials to access your health dashboard.</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email address</label>
                <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', fontSize: 12, color: '#0d9488', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input className="input-field" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}/>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}/>
            </div>

            <button className="google-btn" onClick={handleGoogle}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
              {[
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'SSL Secured' },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Verified Doctors' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Instant Access' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d={b.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}