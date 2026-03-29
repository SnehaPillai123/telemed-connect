import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const STATS = [
  { value: 500,   suffix: "+",  label: "Verified Doctors" },
  { value: 10000, suffix: "+",  label: "Patients Served" },
  { value: 25,    suffix: "+",  label: "Specializations" },
  { value: 98,    suffix: "%",  label: "Satisfaction Rate" },
];

const FEATURES = [
  { icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title:"AI Symptom Checker", desc:"Describe symptoms and our AI instantly matches you with the right specialist — before you even book.", badge:"AI Powered" },
  { icon:'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title:"Ask Before You Book", desc:"Not sure if you need a doctor? Answer 5 quick questions and get instant guidance — consult or self-care.", badge:"Smart" },
  { icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', title:"Digital Prescriptions", desc:"Doctors write prescriptions digitally. Patients can view and order medicines from 1mg or PharmEasy.", badge:"" },
  { icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', title:"Emergency SOS", desc:"One tap activates emergency mode — shares your real-time GPS location with nearby hospitals.", badge:"Critical" },
  { icon:'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', title:"Multilingual Support", desc:"Consult in your language. Our platform supports 8+ Indian languages with real-time translation.", badge:"" },
  { icon:'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', title:"Video Consultations", desc:"Connect face-to-face with your doctor via Google Meet — no downloads, works on any device.", badge:"New" },
];

const HOW_IT_WORKS = [
  { step:"01", title:"Create your account", desc:"Sign up as a patient or doctor in under 2 minutes. No paperwork, no waiting." },
  { step:"02", title:"Find the right doctor", desc:"Use our AI symptom checker or search by specialization to find the best match." },
  { step:"03", title:"Book & consult", desc:"Pick a time slot, book instantly, and consult via video call or chat." },
  { step:"04", title:"Get prescriptions", desc:"Receive digital prescriptions and order medicines with a single click." },
];

const SPECIALIZATIONS = [
  "General Physician","Cardiologist","Dermatologist",
  "Neurologist","Orthopedic","Psychiatrist",
  "Gynecologist","Pediatrician","Ophthalmologist",
  "ENT Specialist","Pulmonologist","Endocrinologist"
];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { font-family:'Inter',sans-serif; box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }

        .l-nav { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(255,255,255,0.96); backdrop-filter:blur(10px); border-bottom:1px solid #e5e7eb; padding:0 24px; height:60px; display:flex; align-items:center; justify-content:space-between; }
        .l-nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .l-nav-links { display:flex; align-items:center; gap:28px; }
        .l-nav-links a { font-size:14px; font-weight:500; color:#374151; text-decoration:none; transition:color 0.15s; }
        .l-nav-links a:hover { color:#0d9488; }
        .l-hamburger { background:none; border:1.5px solid #e5e7eb; border-radius:8px; padding:6px 10px; cursor:pointer; display:none; }
        .l-mobile-menu { display:none; position:fixed; top:60px; left:0; right:0; background:white; border-bottom:1px solid #e5e7eb; padding:16px 24px; z-index:99; flex-direction:column; gap:12px; }
        .l-mobile-menu.open { display:flex; }
        .l-mobile-menu a { font-size:15px; font-weight:500; color:#374151; text-decoration:none; padding:8px 0; border-bottom:1px solid #f3f4f6; }

        .btn-ghost { padding:8px 18px; background:none; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; font-weight:500; color:#374151; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
        .btn-ghost:hover { border-color:#0d9488; color:#0d9488; }
        .btn-hero { padding:14px 28px; background:#0d9488; color:white; border:none; border-radius:10px; font-size:15px; font-weight:700; text-decoration:none; transition:all 0.2s; display:inline-flex; align-items:center; gap:10px; -webkit-tap-highlight-color:transparent; }
        .btn-hero:hover { background:#0f766e; transform:translateY(-2px); box-shadow:0 12px 32px rgba(13,148,136,0.3); }

        .l-hero { min-height:100svh; background:linear-gradient(135deg,#f0fdfa 0%,#ffffff 50%,#f0f9ff 100%); display:flex; flex-direction:column; padding-top:60px; }
        .l-hero-inner { flex:1; display:flex; align-items:center; padding:40px 24px; max-width:1200px; margin:0 auto; width:100%; gap:60px; }
        .l-hero-left  { flex:1; }
        .l-hero-right { flex:1; display:flex; flex-direction:column; gap:14px; }
        .l-hero-badge { display:inline-flex; align-items:center; gap:8px; background:#f0fdfa; border:1px solid #ccfbf1; border-radius:50px; padding:6px 14px; margin-bottom:20px; }
        .l-hero-title { font-size:clamp(32px,5vw,58px); font-weight:900; color:#111827; line-height:1.08; letter-spacing:-0.03em; margin-bottom:20px; }
        .l-hero-title span { color:#0d9488; }
        .l-hero-desc  { font-size:clamp(15px,2vw,18px); color:#6b7280; line-height:1.75; margin-bottom:32px; }

        .l-stats { background:#0d9488; padding:36px 24px; }
        .l-stats-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }

        .l-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .l-feature-card { background:white; border-radius:14px; border:1px solid #e5e7eb; padding:24px; transition:all 0.25s; }
        .l-feature-card:hover { border-color:#0d9488; box-shadow:0 8px 32px rgba(13,148,136,0.1); transform:translateY(-3px); }

        .l-steps-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .l-step-card  { display:flex; gap:18px; align-items:flex-start; padding:24px; background:white; border-radius:14px; border:1px solid #e5e7eb; transition:all 0.2s; }
        .l-step-card:hover { border-color:#0d9488; }
        .l-step-num   { font-size:32px; font-weight:900; color:#e5e7eb; line-height:1; flex-shrink:0; transition:color 0.2s; }
        .l-step-card:hover .l-step-num { color:#0d9488; }

        .l-spec-pill  { padding:10px 18px; background:white; border:1px solid #e5e7eb; border-radius:50px; font-size:14px; font-weight:500; color:#374151; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
        .l-spec-pill:hover { background:#0d9488; border-color:#0d9488; color:white; }

        .l-section       { padding:80px 24px; }
        .l-section-inner { max-width:1200px; margin:0 auto; }
        .l-section-head  { text-align:center; margin-bottom:48px; }
        .l-emergency { background:linear-gradient(135deg,#7f1d1d,#991b1b); padding:72px 24px; text-align:center; }
        .l-footer        { background:#0f172a; padding:48px 24px 24px; }
        .l-footer-grid   { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:40px; }
        .l-footer-bottom { max-width:1200px; margin:0 auto; padding-top:24px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.6s ease forwards; }
        .d1{animation-delay:0.1s;opacity:0} .d2{animation-delay:0.2s;opacity:0} .d3{animation-delay:0.3s;opacity:0} .d4{animation-delay:0.4s;opacity:0}

        @media screen and (min-width:769px) {
          .l-hamburger { display:none !important; }
        }
        @media screen and (max-width:768px) {
          .l-nav-links  { display:none !important; }
          .l-nav-btns   { display:none !important; }
          .l-hamburger  { display:block !important; }
          .l-hero-inner { flex-direction:column; padding:24px 20px 40px; gap:28px; }
          .l-hero-right { display:none; }
          .l-hero-badge { font-size:10px; }
          .l-stats-grid    { grid-template-columns:repeat(2,1fr); gap:16px; }
          .l-features-grid { grid-template-columns:1fr; }
          .l-steps-grid    { grid-template-columns:1fr; }
          .l-footer-grid   { grid-template-columns:1fr; gap:24px; }
          .l-footer-bottom { flex-direction:column; text-align:center; }
          .l-section       { padding:48px 20px; }
          .l-section-head  { margin-bottom:32px; }
          .l-emergency     { padding:48px 20px; }
        }
        @media screen and (min-width:769px) and (max-width:1024px) {
          .l-hero-inner    { gap:32px; padding:32px 24px; }
          .l-stats-grid    { grid-template-columns:repeat(2,1fr); }
          .l-features-grid { grid-template-columns:repeat(2,1fr); }
          .l-steps-grid    { grid-template-columns:repeat(2,1fr); }
          .l-footer-grid   { grid-template-columns:1fr 1fr; gap:32px; }
        }
        @media screen and (max-width:390px) {
          .l-hero-title { font-size:28px; }
          .l-stats-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="l-nav">
        <Link to="/" className="l-nav-logo">
          <div style={{ width:32, height:32, borderRadius:7, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:14, color:'#111827', lineHeight:1.1 }}>TeleMed Connect</p>
            <p style={{ fontSize:9, color:'#0d9488', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Healthcare Platform</p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="l-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#specializations">Specializations</a>
        </div>

        {/* Navbar — Sign in only, no Get started */}
        <div className="l-nav-btns" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link to="/login" className="btn-ghost">Sign in</Link>
        </div>

        {/* Mobile hamburger */}
        <button className="l-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            {menuOpen
              ? <path d="M6 18L18 6M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              : <path d="M4 6h16M4 12h16M4 18h16" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`l-mobile-menu ${menuOpen?'open':''}`}>
        <a href="#features"        onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how-it-works"    onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#specializations" onClick={() => setMenuOpen(false)}>Specializations</a>
        <Link to="/login"
          style={{ fontSize:15, fontWeight:500, color:'#374151', textDecoration:'none', padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}
          onClick={() => setMenuOpen(false)}>
          Sign in
        </Link>
        <Link to="/register"
          style={{ display:'block', padding:'12px', background:'#0d9488', color:'white', borderRadius:8, textAlign:'center', fontWeight:600, textDecoration:'none', marginTop:4 }}
          onClick={() => setMenuOpen(false)}>
          Get started free
        </Link>
      </div>

      {/* HERO */}
      <section className="l-hero">
        <div className="l-hero-inner">
          <div className="l-hero-left">
            <div className="l-hero-badge fade-up d1">
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981' }}/>
              <span style={{ fontSize:11, fontWeight:600, color:'#0d9488', letterSpacing:'0.04em' }}>INDIA'S CONNECTED HEALTHCARE PLATFORM</span>
            </div>
            <h1 className="l-hero-title fade-up d2">
              Healthcare that<br/>comes to <span>you.</span>
            </h1>
            <p className="l-hero-desc fade-up d3">
              Connect with 500+ verified doctors, get AI-powered diagnosis, emergency SOS, multilingual consultations — all in one platform.
            </p>

            {/* Hero CTA — Get started only here */}
            <div className="fade-up d4" style={{ marginBottom:28 }}>
              <Link to="/register" className="btn-hero">
                Get started free
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>

            <div className="fade-up d4" style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              {[
                { icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label:'Verified Doctors' },
                { icon:'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label:'SSL Secured' },
                { icon:'M13 10V3L4 14h7v7l9-11h-7z', label:'Instant Access' },
              ].map((b,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d={b.icon} stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero right cards */}
          <div className="l-hero-right">
            <div style={{ background:'white', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#111827' }}>Upcoming Appointment</p>
                <span style={{ fontSize:11, fontWeight:600, color:'#0d9488', background:'#f0fdfa', padding:'3px 10px', borderRadius:20, border:'1px solid #ccfbf1' }}>Confirmed</span>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#0d9488' }}>RK</span>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Dr. Rajesh Kumar</p>
                  <p style={{ fontSize:11, color:'#6b7280' }}>Cardiologist · 10 yrs</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:14 }}>
                <span style={{ fontSize:11, color:'#374151' }}>📅 Mon, 17 Mar 2026</span>
                <span style={{ fontSize:11, color:'#374151' }}>🕐 10:30 AM</span>
              </div>
            </div>

            <div style={{ background:'#f0fdfa', borderRadius:14, border:'1px solid #ccfbf1', padding:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#0d9488', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>AI Health Tip</p>
              <p style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>A 10-minute walk after meals can reduce blood sugar levels by up to 22%.</p>
            </div>

            <div style={{ background:'#fef2f2', borderRadius:14, border:'1px solid #fecaca', padding:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#dc2626', marginBottom:4 }}>Emergency SOS</p>
                  <p style={{ fontSize:12, color:'#991b1b' }}>One tap — alerts hospitals & shares location</p>
                </div>
                <div style={{ width:40, height:40, borderRadius:10, background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="l-stats">
        <div className="l-stats-grid">
          {STATS.map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <p style={{ fontSize:'clamp(28px,5vw,40px)', fontWeight:900, color:'white', lineHeight:1, marginBottom:6 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix}/>
              </p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', fontWeight:500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="l-section" style={{ background:'#f9fafb' }}>
        <div className="l-section-inner">
          <div className="l-section-head">
            <p style={{ fontSize:11, fontWeight:700, color:'#0d9488', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>WHY TELEMED CONNECT</p>
            <h2 style={{ fontSize:'clamp(24px,4vw,42px)', fontWeight:800, color:'#111827', letterSpacing:'-0.02em', marginBottom:14, lineHeight:1.2 }}>Everything you need,<br/>nothing you don't.</h2>
            <p style={{ fontSize:16, color:'#6b7280', maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>Built for patients who want convenience and doctors who want efficiency.</p>
          </div>
          <div className="l-features-grid">
            {FEATURES.map((f,i) => (
              <article key={i} className="l-feature-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:11, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d={f.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {f.badge && <span style={{ fontSize:10, fontWeight:700, color:'#0d9488', background:'#f0fdfa', padding:'3px 9px', borderRadius:20, border:'1px solid #ccfbf1' }}>{f.badge}</span>}
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="l-section" style={{ background:'white' }}>
        <div className="l-section-inner">
          <div className="l-section-head">
            <p style={{ fontSize:11, fontWeight:700, color:'#0d9488', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>SIMPLE PROCESS</p>
            <h2 style={{ fontSize:'clamp(24px,4vw,42px)', fontWeight:800, color:'#111827', letterSpacing:'-0.02em', lineHeight:1.2 }}>From symptom to solution<br/>in minutes.</h2>
          </div>
          <div className="l-steps-grid">
            {HOW_IT_WORKS.map((s,i) => (
              <div key={i} className="l-step-card">
                <p className="l-step-num">{s.step}</p>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:6 }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS */}
      <section id="specializations" className="l-section" style={{ background:'#f9fafb' }}>
        <div className="l-section-inner">
          <div className="l-section-head">
            <p style={{ fontSize:11, fontWeight:700, color:'#0d9488', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>SPECIALIZATIONS</p>
            <h2 style={{ fontSize:'clamp(22px,3vw,38px)', fontWeight:800, color:'#111827', letterSpacing:'-0.02em', marginBottom:10, lineHeight:1.2 }}>Whatever you need, we have a specialist.</h2>
            <p style={{ fontSize:15, color:'#6b7280' }}>Browse from 25+ medical specializations and book instantly.</p>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', marginBottom:36 }}>
            {SPECIALIZATIONS.map((s,i) => (
              <Link key={i} to="/register" className="l-spec-pill">{s}</Link>
            ))}
          </div>
          <div style={{ textAlign:'center' }}>
            <Link to="/register" style={{ padding:'13px 28px', background:'#0d9488', color:'white', borderRadius:10, fontSize:15, fontWeight:700, textDecoration:'none', display:'inline-block' }}>
              Find Your Doctor Now
            </Link>
          </div>
        </div>
      </section>

      {/* EMERGENCY */}
      <section id="emergency" className="l-emergency">
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ width:60, height:60, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <h2 style={{ fontSize:'clamp(24px,4vw,44px)', fontWeight:800, color:'white', marginBottom:14, letterSpacing:'-0.02em', lineHeight:1.2 }}>
            Medical emergency?<br/>One tap is all it takes.
          </h2>
          <p style={{ fontSize:'clamp(14px,2vw,17px)', color:'rgba(255,255,255,0.75)', marginBottom:32, lineHeight:1.7 }}>
            Our Emergency SOS feature instantly shares your GPS location with nearby hospitals — even when you can't speak.
          </p>
          <Link to="/register" style={{ padding:'14px 36px', background:'white', color:'#dc2626', borderRadius:10, fontSize:15, fontWeight:800, textDecoration:'none', display:'inline-block' }}>
            Set Up Emergency SOS
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div className="l-footer-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:7, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontWeight:800, fontSize:14, color:'white' }}>TeleMed Connect</p>
                <p style={{ fontSize:9, color:'#0d9488', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Healthcare Platform</p>
              </div>
            </div>
            <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.8, maxWidth:260, marginBottom:20 }}>
              India's most connected healthcare platform — bringing verified doctors and emergency care to your fingertips.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['AI Powered','Multilingual','Emergency SOS'].map((tag,i) => (
                <span key={i} style={{ fontSize:11, fontWeight:600, color:'#0d9488', background:'rgba(13,148,136,0.1)', padding:'4px 10px', borderRadius:20 }}>{tag}</span>
              ))}
            </div>
          </div>
          {[
            { title:'Platform', links:['Find Doctors','Symptom Checker','Book Appointment','Prescriptions','Emergency SOS'] },
            { title:'Specializations', links:['Cardiologist','Neurologist','Dermatologist','Orthopedic','Psychiatrist'] },
            { title:'For Doctors', links:['Join as Doctor','Manage Appointments','Write Prescriptions','Set Availability','Patient Records'] },
          ].map((col,i) => (
            <div key={i}>
              <p style={{ fontSize:12, fontWeight:700, color:'white', marginBottom:14, letterSpacing:'0.04em' }}>{col.title}</p>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9 }}>
                {col.links.map((link,j) => (
                  <li key={j}>
                    <Link to="/register" style={{ fontSize:13, color:'#6b7280', textDecoration:'none', transition:'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color='#0d9488'}
                      onMouseLeave={e => e.target.style.color='#6b7280'}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="l-footer-bottom">
          <p style={{ fontSize:12, color:'#4b5563' }}>© 2026 TeleMed Connect. All rights reserved.</p>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {['Privacy Policy','Terms of Service','Contact Us'].map((link,i) => (
              <Link key={i} to="/register" style={{ fontSize:12, color:'#4b5563', textDecoration:'none' }}>{link}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
