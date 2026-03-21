import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PATIENT_NAV = [
  { section: "Main", items: [
    { to: '/patient-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/my-appointments', label: 'Appointments & Records', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/search-doctors', label: 'Find Doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  ]},
  { section: "Health Tools", items: [
    { to: '/health-center', label: 'Health Center', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: 'AI' },
    { to: '/my-prescriptions', label: 'Prescriptions & Meds', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ]},
  { section: "Care", items: [
    { to: '/nearby-hospitals', label: 'Hospitals & Emergency', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', emergency: true },
    { to: '/edit-profile', label: 'Health Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]},
];

const DOCTOR_NAV = [
  { section: "Main", items: [
    { to: '/doctor-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/doctor-appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/edit-profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]},
  { section: "Doctor Tools", items: [
    { to: '/doctor-appointments', label: 'Write Prescription', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { to: '/edit-profile', label: 'Update Availability', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]},
];

export default function Layout({ children, title, subtitle }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const navItems = role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV;
  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const portalLabel = role === 'doctor' ? 'Doctor Portal' : 'Patient Portal';
  const isPhone = windowWidth < 600;
  const isDesktop = windowWidth >= 992;
  const SIDEBAR_WIDTH = 250;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 992) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    if (window.innerWidth >= 992) setSidebarOpen(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f9fafb', position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',sans-serif; box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .anim-fade-up { animation:fadeUp 0.45s ease both; }

        /* ── SIDEBAR ── */
        .lyt-sidebar {
          width:${SIDEBAR_WIDTH}px; background:white;
          border-right:1px solid #e5e7eb;
          display:flex; flex-direction:column;
          position:fixed; top:0; left:0; height:100vh;
          z-index:60; overflow-y:auto;
          transition:transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease;
        }
        .lyt-sidebar.open  { transform:translateX(0); box-shadow:4px 0 20px rgba(0,0,0,0.07); }
        .lyt-sidebar.closed{ transform:translateX(-100%); }

        /* ── OVERLAY ── */
        .lyt-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.45);
          z-index:55; backdrop-filter:blur(2px); cursor:pointer;
        }

        /* ── MAIN ── */
        .lyt-main {
          flex:1; display:flex; flex-direction:column;
          min-height:100vh; min-width:0;
          transition:margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
          max-width:100vw; overflow-x:hidden;
        }
        .lyt-main.push { margin-left:${SIDEBAR_WIDTH}px; }
        .lyt-main.full { margin-left:0; }

        /* ── TOP BAR ── */
        .lyt-topbar {
          background:white; border-bottom:1px solid #e5e7eb;
          padding:0 20px; height:56px;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:40; gap:12px;
        }

        /* ── HAMBURGER ── */
        .lyt-hamburger {
          width:40px; height:40px; border-radius:8px;
          border:1.5px solid #e5e7eb; background:white;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s; flex-shrink:0;
          -webkit-tap-highlight-color:transparent;
        }
        .lyt-hamburger:hover { border-color:#0d9488; background:#f0fdfa; }

        /* ── NAV ITEMS ── */
        .lyt-nav-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:8px;
          text-decoration:none; color:#6b7280;
          font-size:13px; font-weight:500;
          transition:all 0.15s;
          -webkit-tap-highlight-color:transparent;
          min-height:44px;
        }
        .lyt-nav-item:hover  { background:#f0fdfa; color:#0d9488; }
        .lyt-nav-item.active { background:#f0fdfa; color:#0d9488; font-weight:600; }
        .lyt-nav-item.emer   { color:#dc2626; }
        .lyt-nav-item.emer:hover  { background:#fef2f2; }
        .lyt-nav-item.emer.active { background:#fef2f2; }

        .lyt-badge {
          font-size:9px; font-weight:700; color:#0d9488;
          background:#f0fdfa; padding:1px 6px; border-radius:20px;
          border:1px solid #ccfbf1; flex-shrink:0;
        }

        .lyt-signout {
          width:100%; padding:10px 12px;
          background:none; border:1.5px solid #e5e7eb; border-radius:8px;
          font-size:13px; font-weight:500; color:#374151;
          cursor:pointer; display:flex; align-items:center; gap:8px;
          font-family:Inter,sans-serif; transition:all 0.15s;
          min-height:44px;
        }
        .lyt-signout:hover { border-color:#0d9488; color:#0d9488; }

        /* ── CONTENT ── */
        .lyt-content { padding:16px; flex:1; }

        /* ── GRID HELPERS ── */
        .grid-1col { display:grid; grid-template-columns:1fr; gap:12px; }
        .grid-2col { display:grid; grid-template-columns:1fr 300px; gap:16px; }
        .grid-3col { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .grid-4col { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }

        /* ── TABS ── */
        .tab-bar { display:flex; gap:4px; background:#f3f4f6; border-radius:10px; padding:4px; margin-bottom:16px; overflow-x:auto; }
        .tab-btn { flex:1; padding:8px 10px; border:none; border-radius:7px; font-size:12px; font-weight:500; color:#6b7280; cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif; background:none; white-space:nowrap; min-height:38px; -webkit-tap-highlight-color:transparent; }
        .tab-btn.active { background:white; color:#111827; font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
        .tab-btn:hover:not(.active) { color:#0d9488; }

        /* ═══════════════════════════
           RESPONSIVE BREAKPOINTS
        ═══════════════════════════ */

        /* DESKTOP ≥ 992px */
        @media screen and (min-width:992px) {
          .lyt-content  { padding:24px 28px; }
          .lyt-topbar   { padding:0 28px; }
          .grid-2col    { grid-template-columns:1fr 300px; }
          .grid-3col    { grid-template-columns:repeat(3,1fr); }
          .grid-4col    { grid-template-columns:repeat(4,1fr); }
        }

        /* TABLET 600–991px */
        @media screen and (min-width:600px) and (max-width:991px) {
          .lyt-main     { margin-left:0 !important; }
          .lyt-content  { padding:16px 18px; }
          .grid-2col    { grid-template-columns:1fr !important; }
          .grid-3col    { grid-template-columns:repeat(2,1fr) !important; }
          .grid-4col    { grid-template-columns:repeat(2,1fr) !important; }
          .tab-btn      { font-size:12px; padding:7px 8px; }
          .dash-main    { grid-template-columns:1fr !important; }
          .dash-stats   { grid-template-columns:repeat(3,1fr) !important; }
        }

        /* PHONE < 600px */
        @media screen and (max-width:599px) {
          .lyt-main     { margin-left:0 !important; }
          .lyt-content  { padding:12px; }
          .lyt-topbar   { padding:0 12px; height:52px; }
          .lyt-sidebar  { width:min(270px, 85vw); }
          .lyt-hamburger{ width:44px; height:44px; }
          .lyt-nav-item { padding:12px; font-size:14px; }
          .grid-2col,.grid-3col,.grid-4col { grid-template-columns:1fr !important; }
          .hide-phone   { display:none !important; }
          .tab-btn      { font-size:11px; padding:8px 6px; }
          .dash-main    { grid-template-columns:1fr !important; }
          .dash-stats   { grid-template-columns:repeat(2,1fr) !important; }

          /* Make all cards full width on phone */
          [style*="grid-template-columns"] { grid-template-columns:1fr !important; }

          /* Fix hardcoded widths in child pages */
          .nsb-wrap { flex-direction:column !important; }
          .nsb-btns { width:100% !important; }
          .nsb-btn-primary,.nsb-btn-secondary { flex:1; text-align:center; }

          /* Action rows wrap nicely */
          .action-row { gap:6px !important; }
          .meet-btn,.chat-btn,.rx-btn { font-size:11px !important; padding:6px 10px !important; }

          /* Appointment cards */
          .apt-card { padding:12px !important; }

          /* Filter chips */
          .filter-chip,.filter-btn { padding:5px 10px !important; font-size:11px !important; }
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion:reduce) {
          *,*::before,*::after { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
        }

        /* PRINT */
        @media print {
          .lyt-sidebar,.lyt-topbar,.lyt-overlay { display:none !important; }
          .lyt-main { margin-left:0 !important; }
        }

        /* TOUCH IMPROVEMENTS */
        button, a { -webkit-tap-highlight-color:transparent; }
        input, select, textarea { font-size:16px !important; } /* Prevent iOS zoom */
        @media screen and (max-width:599px) {
          input, select, textarea { font-size:16px !important; }
        }
      `}</style>

      {/* Overlay */}
      {sidebarOpen && !isDesktop && (
        <div className="lyt-overlay" onClick={() => setSidebarOpen(false)}
          role="button" aria-label="Close sidebar" tabIndex={0}
          onKeyDown={e => e.key==='Enter' && setSidebarOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside id="main-sidebar" className={`lyt-sidebar ${sidebarOpen?'open':'closed'}`}
        role="navigation" aria-label="Main navigation">
        <div style={{ padding:'14px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:7, background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:13, color:'#111827', lineHeight:1.1 }}>TeleMed Connect</p>
              <p style={{ fontSize:9, color:'#0d9488', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{portalLabel}</p>
            </div>
          </div>
          {!isDesktop && (
            <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"
              style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:8, borderRadius:6, minWidth:40, minHeight:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {navItems.map((section, si) => (
            <div key={si} style={{ marginBottom:4 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', padding:'6px 12px 3px' }}>
                {section.section}
              </p>
              {section.items.map((item, ii) => (
                <Link key={ii} to={item.to}
                  className={`lyt-nav-item ${item.emergency?'emer':''} ${location.pathname===item.to?'active':''}`}
                  aria-current={location.pathname===item.to?'page':undefined}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                    <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ flex:1 }}>{item.label}</span>
                  {item.badge && <span className="lyt-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding:'10px 8px', borderTop:'1px solid #f3f4f6', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:8, background:'#f9fafb', marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {role==='doctor'?`Dr. ${user?.displayName}`:user?.displayName}
              </p>
              <p style={{ fontSize:10, color:'#0d9488', fontWeight:500, textTransform:'capitalize' }}>{role}</p>
            </div>
          </div>
          <button className="lyt-signout" onClick={handleSignOut}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`lyt-main ${sidebarOpen&&isDesktop?'push':'full'}`}>
        <header className="lyt-topbar" role="banner">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="lyt-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen?"Close navigation":"Open navigation"}
              aria-expanded={sidebarOpen} aria-controls="main-sidebar">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                {sidebarOpen && isDesktop
                  ? <path d="M6 18L18 6M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                  : <path d="M4 6h16M4 12h16M4 18h16" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                }
              </svg>
            </button>
            <div className="anim-fade-up">
              {subtitle && <p style={{ fontSize:11, color:'#9ca3af', fontWeight:500, lineHeight:1 }}>{subtitle}</p>}
              {title && <h1 style={{ fontSize:isPhone?14:17, fontWeight:700, color:'#111827', letterSpacing:'-0.01em', lineHeight:1.2 }}>{title}</h1>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'#f0fdfa', borderRadius:7, border:'1px solid #ccfbf1' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', animation:'pulse 2s infinite' }}/>
              {!isPhone && <span style={{ fontSize:11, color:'#0f766e', fontWeight:600 }}>Online</span>}
            </div>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700 }}>
              {initials}
            </div>
          </div>
        </header>
        <div className="lyt-content" role="main" id="main-content">{children}</div>
      </div>
    </div>
  );
}