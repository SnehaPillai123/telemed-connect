import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();

  const redirect = (r) => r === "doctor" ? navigate("/doctor-dashboard") : navigate("/patient-dashboard");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back");
      navigate("/patient-dashboard")
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Signed in with Google");
    } catch (err) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .input-field { width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #0d9488; background: white; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .primary-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
        .primary-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.3); }
        .primary-btn:disabled { opacity: 0.6; transform: none; }
        .google-btn { width: 100%; padding: 12px; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .google-btn:hover { border-color: #94a3b8; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Left Panel */}
        <div style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(13,148,136,0.12)' }}/>
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(2,132,199,0.1)' }}/>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M12 6v4M12 14v4M8 12H4M20 12h-4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 20 }}>TeleMed Connect</p>
                <p style={{ color: '#64748b', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Healthcare Platform</p>
              </div>
            </div>

            <h2 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 42, fontWeight: 400, lineHeight: 1.2, marginBottom: 20 }}>
              Healthcare at<br/>your fingertips.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 48 }}>
              Connect with certified doctors, manage prescriptions, and take control of your health — all in one place.
            </p>

            {[
              'AI-powered symptom analysis',
              'Multilingual consultations',
              'Instant medicine ordering',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(13,148,136,0.3)', border: '1.5px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                    <path d="M5 12l5 5L20 7" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 14 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#f8fafc' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 32, color: '#0f172a', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 36 }}>
              Sign in to your account to continue
            </p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label>Email address</label>
                <input className="input-field" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required/>
              </div>
              <div>
                <label>Password</label>
                <input className="input-field" type="password" placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required/>
              </div>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}/>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>or</p>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}/>
            </div>

            <button className="google-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 28 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}