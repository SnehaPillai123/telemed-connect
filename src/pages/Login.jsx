import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return toast.error("Please fill all fields");
    setLoading(true);
    try {
<<<<<<< HEAD
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back");
      navigate("/patient-dashboard")
=======
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      const role = userDoc.data()?.role;
      toast.success("Welcome back!");
      if (role === "doctor") navigate("/doctor-dashboard");
      else navigate("/patient-dashboard");
>>>>>>> upstream/main
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" ? "Invalid email or password" :
                  err.code === "auth/user-not-found" ? "No account found with this email" :
                  err.code === "auth/wrong-password" ? "Incorrect password" : "Login failed. Please try again.";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',sans-serif; box-sizing:border-box; margin:0; padding:0; }

        .login-wrap  { min-height:100svh; display:flex; background:#f9fafb; }
        .login-left  { width:420px; flex-shrink:0; background:linear-gradient(160deg,#0d9488,#0f766e); display:flex; flex-direction:column; justify-content:center; padding:48px 40px; }
        .login-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; overflow-y:auto; }
        .login-card  { width:100%; max-width:420px; }

        .l-input { width:100%; padding:13px 14px; border:1.5px solid #e5e7eb; border-radius:9px; font-size:16px; color:#111827; background:white; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; -webkit-appearance:none; }
        .l-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
        .l-label { font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px; }
        .l-btn { width:100%; padding:14px; background:#0d9488; color:white; border:none; border-radius:9px; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif; min-height:48px; -webkit-tap-highlight-color:transparent; }
        .l-btn:hover    { background:#0f766e; transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,148,136,0.3); }
        .l-btn:disabled { background:#5eead4; cursor:not-allowed; transform:none; box-shadow:none; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.5s ease forwards; }

        /* ── TABLET ── */
        @media screen and (max-width:900px) {
          .login-left { width:340px; padding:40px 28px; }
        }

        /* ── MOBILE ── */
        @media screen and (max-width:700px) {
          .login-left  { display:none !important; }
          .login-right { padding:32px 20px; align-items:flex-start; min-height:100svh; }
          .login-card  { max-width:100%; }
          .l-mobile-header { display:flex !important; }
        }

        /* Mobile header (logo) — hidden on desktop */
        .l-mobile-header { display:none; align-items:center; gap:10px; margin-bottom:32px; }
      `}</style>

      <div className="login-wrap">

        {/* ── LEFT PANEL (hidden on mobile) ── */}
        <div className="login-left">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:44 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:16, color:'white', lineHeight:1.1 }}>TeleMed Connect</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.7)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Healthcare Platform</p>
            </div>
          </div>

          <h2 style={{ fontSize:30, fontWeight:800, color:'white', lineHeight:1.2, marginBottom:18, letterSpacing:'-0.02em' }}>
            Healthcare that<br/>comes to you.
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.8)', lineHeight:1.8, marginBottom:36 }}>
            Connect with 500+ verified doctors, get AI-powered diagnosis, emergency SOS, and multilingual consultations.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text:'500+ Verified Doctors' },
              { icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', text:'AI Symptom Checker' },
              { icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', text:'Emergency SOS' },
            ].map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d={f.icon} stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.9)', fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop:44, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display:'flex', gap:24 }}>
              {[['500+','Doctors'],['10K+','Patients'],['98%','Satisfaction']].map(([val,label],i) => (
                <div key={i}>
                  <p style={{ fontSize:22, fontWeight:800, color:'white', lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', marginTop:3 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-card fade-up">

            {/* Logo shown only on mobile */}
            <div className="l-mobile-header">
              <div style={{ width:36, height:36, borderRadius:8, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontWeight:800, fontSize:15, color:'#111827' }}>TeleMed Connect</p>
                <p style={{ fontSize:9, color:'#0d9488', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Healthcare Platform</p>
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', letterSpacing:'-0.02em', marginBottom:6 }}>Welcome back</h1>
              <p style={{ fontSize:14, color:'#6b7280' }}>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label className="l-label" htmlFor="email">Email address</label>
                <input id="email" className="l-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>
              </div>
              <div>
                <label className="l-label" htmlFor="password">Password</label>
                <div style={{ position:'relative' }}>
                  <input id="password" className="l-input"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight:48 }}/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:6, minWidth:36, minHeight:36, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      {showPass
                        ? <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        : <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      }
                    </svg>
                  </button>
                </div>
              </div>
              <button className="l-btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div style={{ marginTop:20, padding:'14px 16px', background:'#f0fdfa', borderRadius:9, border:'1px solid #ccfbf1' }}>
              <p style={{ fontSize:13, color:'#0f766e', textAlign:'center', lineHeight:1.6 }}>
                New to TeleMed Connect?{' '}
                <Link to="/register" style={{ fontWeight:700, color:'#0d9488', textDecoration:'none' }}>Create a free account →</Link>
              </p>
            </div>

            <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:16, lineHeight:1.6 }}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
