import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const STATS = [
  { value: 500, suffix: "+", label: "Verified Doctors" },
  { value: 10000, suffix: "+", label: "Patients Served" },
  { value: 25, suffix: "+", label: "Specializations" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
];

const FEATURES = [
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: "AI Symptom Checker",
    desc: "Describe your symptoms and our AI instantly matches you with the right specialist — saving you time and unnecessary consultations."
  },
  {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    title: "Emergency SOS",
    desc: "One tap activates emergency mode — shares your real-time GPS location with nearby hospitals and your emergency contacts instantly."
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: "Digital Prescriptions",
    desc: "Doctors write prescriptions digitally. Patients can view, download, and order medicines directly from 1mg or PharmEasy with one click."
  },
  {
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
    title: "Multilingual Support",
    desc: "Consult in your language. Our platform supports 8+ Indian languages with real-time translation so language is never a barrier to care."
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: "Smart Scheduling",
    desc: "Book appointments with verified doctors in under 2 minutes. Choose your date, time slot, and get instant confirmation."
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: "Secure & Private",
    desc: "Your health data is encrypted and stored securely. We follow strict medical data privacy standards — your records are yours alone."
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create your account", desc: "Sign up as a patient or doctor in under 2 minutes. No paperwork, no waiting." },
  { step: "02", title: "Find the right doctor", desc: "Use our AI symptom checker or search by specialization to find the best match." },
  { step: "03", title: "Book & consult", desc: "Pick a time slot, book instantly, and consult online or in person." },
  { step: "04", title: "Get prescriptions", desc: "Receive digital prescriptions and order medicines with a single click." },
];

const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist",
  "Neurologist", "Orthopedic", "Psychiatrist",
  "Gynecologist", "Pediatrician", "Ophthalmologist", "ENT Specialist",
  "Pulmonologist", "Endocrinologist"
];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        /* Navbar */
        .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; padding: 0 60px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-links a { font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; transition: color 0.15s; }
        .nav-links a:hover { color: #0d9488; }
        .nav-cta { display: flex; align-items: center; gap: 12px; }
        .btn-ghost { padding: 8px 20px; background: none; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; transition: all 0.15s; }
        .btn-ghost:hover { border-color: #0d9488; color: #0d9488; }
        .btn-solid { padding: 8px 20px; background: #0d9488; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; color: white; text-decoration: none; transition: all 0.15s; }
        .btn-solid:hover { background: #0f766e; }

        /* Hero */
        .hero { min-height: 100vh; background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 50%, #f0f9ff 100%); display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .hero-content { flex: 1; display: flex; align-items: center; padding: 120px 60px 80px; max-width: 1400px; margin: 0 auto; width: 100%; gap: 80px; }
        .hero-left { flex: 1; }
        .hero-right { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 50px; padding: 6px 16px; margin-bottom: 24px; }
        .hero-title { font-size: clamp(36px, 5vw, 64px); font-weight: 900; color: #111827; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero-title span { color: #0d9488; }
        .hero-desc { font-size: 18px; color: #6b7280; line-height: 1.75; margin-bottom: 40px; max-width: 520px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
        .btn-hero-primary { padding: 16px 32px; background: #0d9488; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 10px; }
        .btn-hero-primary:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,148,136,0.3); }
        .btn-hero-secondary { padding: 16px 32px; background: white; color: #111827; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; font-weight: 600; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 10px; }
        .btn-hero-secondary:hover { border-color: #0d9488; color: #0d9488; transform: translateY(-2px); }
        .hero-trust { display: flex; align-items: center; gap: 20px; }

        /* Stats bar */
        .stats-bar { background: #0d9488; padding: 40px 60px; }
        .stats-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
        .stat-item { text-align: center; }

        /* Feature cards */
        .feature-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 28px; transition: all 0.25s; cursor: default; }
        .feature-card:hover { border-color: #0d9488; box-shadow: 0 8px 32px rgba(13,148,136,0.1); transform: translateY(-4px); }
        .feature-icon { width: 52px; height: 52px; border-radius: 12px; background: #f0fdfa; border: 1px solid #ccfbf1; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }

        /* How it works */
        .step-card { display: flex; gap: 24px; align-items: flex-start; padding: 28px; background: white; border-radius: 16px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .step-card:hover { border-color: #0d9488; box-shadow: 0 4px 20px rgba(13,148,136,0.08); }
        .step-num { font-size: 36px; font-weight: 900; color: #e5e7eb; line-height: 1; flex-shrink: 0; transition: color 0.2s; }
        .step-card:hover .step-num { color: #0d9488; }

        /* Specializations */
        .spec-pill { padding: 10px 20px; background: white; border: 1px solid #e5e7eb; border-radius: 50px; font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; transition: all 0.15s; white-space: nowrap; }
        .spec-pill:hover { background: #0d9488; border-color: #0d9488; color: white; transform: translateY(-2px); }

        /* Emergency banner */
        .emergency-banner { background: linear-gradient(135deg, #7f1d1d, #991b1b); padding: 60px; text-align: center; }

        /* Footer */
        .footer { background: #0f172a; padding: 60px; }
        .footer-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 48px; }
        .footer-bottom { max-width: 1400px; margin: 0 auto; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }

        /* Animations */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }

        /* Responsive */
        @media screen and (max-width: 1024px) {
          .hero-content { gap: 40px; padding: 100px 40px 60px; }
          .stats-grid { grid-template-columns: repeat(2,1fr); gap: 24px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media screen and (max-width: 768px) {
          .landing-nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hero-content { flex-direction: column; padding: 90px 20px 40px; gap: 40px; }
          .hero-right { display: none; }
          .hero-title { font-size: 36px; }
          .stats-bar { padding: 32px 20px; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer { padding: 40px 20px; }
          .emergency-banner { padding: 40px 20px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="landing-nav" role="navigation" aria-label="Main navigation">
        <Link to="/" className="nav-logo" aria-label="TeleMed Connect Home">
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', lineHeight: 1.1 }}>TeleMed Connect</p>
            <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Healthcare Platform</p>
          </div>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#specializations">Specializations</a>
          <a href="#emergency">Emergency</a>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-solid">Get started free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero section">

        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: 80, right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(13,148,136,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} aria-hidden="true"/>
        <div style={{ position: 'absolute', bottom: 100, left: '3%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(2,132,199,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} aria-hidden="true"/>

        <div className="hero-content">
          <div className="hero-left">
            <div className={`hero-badge fade-up delay-1`}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} aria-hidden="true"/>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', letterSpacing: '0.04em' }}>INDIA'S MOST CONNECTED HEALTHCARE PLATFORM</span>
            </div>

            <h1 className={`hero-title fade-up delay-2`}>
              Healthcare that<br/>
              comes to <span>you.</span>
            </h1>

            <p className={`hero-desc fade-up delay-3`}>
              Connect with 500+ verified doctors, get AI-powered diagnosis support, emergency SOS, multilingual consultations — all in one platform built for every Indian.
            </p>

            <div className={`hero-actions fade-up delay-4`}>
              <Link to="/register" className="btn-hero-primary">
                Get started free
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                Sign in to your account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="hero-trust fade-up delay-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Verified Doctors</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#d1d5db' }} aria-hidden="true"/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>SSL Secured</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#d1d5db' }} aria-hidden="true"/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Instant Access</span>
              </div>
            </div>
          </div>

          {/* Right side — info cards */}
          <div className="hero-right">
            {/* Appointment card */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Upcoming Appointment</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '3px 10px', borderRadius: 20, border: '1px solid #ccfbf1' }}>Confirmed</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0d9488' }}>RK</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Dr. Rajesh Kumar</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Cardiologist · 10 yrs exp</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Mon, 17 Mar 2026</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>10:30 AM</span>
                </div>
              </div>
            </div>

            {/* AI tip card */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>AI Health Tip</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>A 10-minute walk after meals can reduce blood sugar levels by up to 22%.</p>
                </div>
              </div>
            </div>

            {/* Emergency card */}
            <div style={{ background: '#fef2f2', borderRadius: 16, border: '1px solid #fecaca', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Emergency SOS</p>
                  <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>One tap — alerts hospitals & shares your location</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>

            {/* Prescription card */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Latest Prescription</p>
                <span style={{ fontSize: 11, color: '#6b7280' }}>2 days ago</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Viral Fever</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#c2410c', background: '#fff7ed', padding: '4px 10px', borderRadius: 20, border: '1px solid #fed7aa' }}>Order on 1mg</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '4px 10px', borderRadius: 20, border: '1px solid #ccfbf1' }}>PharmEasy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar" aria-label="Platform statistics">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <p style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 6 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 60px', background: '#f9fafb' }} aria-label="Platform features">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>WHY TELEMED CONNECT</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Everything you need,<br/>nothing you don't.
            </h2>
            <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Built for patients who want convenience and doctors who want efficiency — without the complexity of traditional platforms.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <article key={i} className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={f.icon} stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 60px', background: 'white' }} aria-label="How it works">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>SIMPLE PROCESS</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 16 }}>
              From symptom to solution<br/>in minutes.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="step-card">
                <p className="step-num">{s.step}</p>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ── */}
      <section id="specializations" style={{ padding: '80px 60px', background: '#f9fafb' }} aria-label="Medical specializations">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>SPECIALIZATIONS</p>
            <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Whatever you need, we have a specialist.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280' }}>Browse from 25+ medical specializations and book instantly.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
            {SPECIALIZATIONS.map((s, i) => (
              <Link key={i} to="/register" className="spec-pill">{s}</Link>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={{ padding: '14px 32px', background: '#0d9488', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background='#0f766e'; e.target.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background='#0d9488'; e.target.style.transform='none'; }}>
              Find Your Doctor Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY BANNER ── */}
      <section id="emergency" className="emergency-banner" aria-label="Emergency SOS feature">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Medical emergency?<br/>One tap is all it takes.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 40, lineHeight: 1.7 }}>
            Our Emergency SOS feature instantly shares your GPS location with nearby hospitals and emergency contacts — even when you can't speak.
          </p>
          <Link to="/register" style={{ padding: '16px 40px', background: 'white', color: '#dc2626', borderRadius: 10, fontSize: 16, fontWeight: 800, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 12px 32px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.target.style.transform='none'; e.target.style.boxShadow='none'; }}>
            Set Up Emergency SOS
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>TeleMed Connect</p>
                <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Healthcare Platform</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>
              India's most connected healthcare platform — bringing verified doctors, AI diagnostics, and emergency care to your fingertips.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['AI Powered', 'Multilingual', 'Emergency SOS'].map((tag, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', background: 'rgba(13,148,136,0.1)', padding: '4px 10px', borderRadius: 20 }}>{tag}</span>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Find Doctors', 'Symptom Checker', 'Book Appointment', 'Prescriptions', 'Emergency SOS'] },
            { title: 'Specializations', links: ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Psychiatrist'] },
            { title: 'For Doctors', links: ['Join as Doctor', 'Manage Appointments', 'Write Prescriptions', 'Set Availability', 'Patient Records'] },
          ].map((col, i) => (
            <div key={i}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16, letterSpacing: '0.04em' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link to="/register" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
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

        <div className="footer-bottom">
          <p style={{ fontSize: 13, color: '#4b5563' }}>© 2026 TeleMed Connect. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link, i) => (
              <Link key={i} to="/register" style={{ fontSize: 13, color: '#4b5563', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color='#0d9488'}
                onMouseLeave={e => e.target.style.color='#4b5563'}>
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
