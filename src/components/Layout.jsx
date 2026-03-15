import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PATIENT_NAV = [
  { section: "Main", items: [
    { to: '/patient-dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/my-appointments', label: 'My Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/search-doctors', label: 'Find Doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  ]},
  { section: "Health Tools", items: [
    { to: '/ask-before-book', label: 'Ask Before You Book', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: 'Smart' },
    { to: '/symptom-checker', label: 'Symptom Checker', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: 'AI' },
    { to: '/my-prescriptions', label: 'Prescriptions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to: '/medication-tracker', label: 'Medication Tracker', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', badge: 'New' },
    { to: '/health-records', label: 'Health Records', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]},
  { section: "Care", items: [
    { to: '/nearby-hospitals', label: 'Nearby Hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { to: '/edit-profile', label: 'Health Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/emergency', label: 'Emergency SOS', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', emergency: true },
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navItems = role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV;
  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const portalLabel = role === 'doctor' ? 'Doctor Portal' : 'Patient Portal';

  // Breakpoints matching experiment requirements
  const isPhone = windowWidth < 600;       // Extra small < 600px
  const isTablet = windowWidth >= 600 && windowWidth < 992;  // Small/Medium
  const isDesktop = windowWidth >= 992;    // Large

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // On desktop, sidebar open by default
      if (window.innerWidth >= 992) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    // Set initial state
    if (window.innerWidth >= 992) setSidebarOpen(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const SIDEBAR_WIDTH = 250;

  return (
    <>
      <style>{`
        /* ─── IMPORT FONT ─── */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* ─── RESET ─── */
        *, *::before, *::after { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── ANIMATIONS (Experiment 3) ─── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes sidebarSlide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        /* Utility animation classes */
        .anim-fade-up   { animation: fadeUp 0.5s ease both; }
        .anim-slide-left  { animation: slideInLeft 0.4s ease both; }
        .anim-slide-right { animation: slideInRight 0.4s ease both; }
        .anim-delay-1 { animation-delay: 0.08s; }
        .anim-delay-2 { animation-delay: 0.16s; }
        .anim-delay-3 { animation-delay: 0.24s; }

        /* ─── LAYOUT ROOT ─── */
        .layout-root { display: flex; min-height: 100vh; background: #f9fafb; position: relative; }

        /* ─── SIDEBAR ─── */
        .sidebar {
          width: ${SIDEBAR_WIDTH}px;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 60;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s ease;
          will-change: transform;
        }
        .sidebar.open  { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
        .sidebar.closed { transform: translateX(-100%); box-shadow: none; }

        /* ─── OVERLAY (mobile/tablet) ─── */
        .sidebar-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 55;
          backdrop-filter: blur(3px);
          animation: fadeUp 0.2s ease;
          cursor: pointer;
        }

        /* ─── MAIN AREA ─── */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ─── TOP BAR ─── */
        .top-bar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
          gap: 12px;
        }

        /* ─── HAMBURGER ─── */
        .hamburger {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          background: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          /* Accessibility: visible focus */
        }
        .hamburger:hover  { border-color: #0d9488; background: #f0fdfa; }
        .hamburger:focus  { outline: 2px solid #0d9488; outline-offset: 2px; }

        /* ─── NAV ITEMS ─── */
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #6b7280;
          font-size: 13px; font-weight: 500;
          transition: all 0.15s;
          /* Accessibility: visible focus */
        }
        .nav-item:hover  { background: #f0fdfa; color: #0d9488; }
        .nav-item:focus  { outline: 2px solid #0d9488; outline-offset: 1px; }
        .nav-item.active { background: #f0fdfa; color: #0d9488; font-weight: 600; }
        .nav-item.emer   { color: #dc2626; }
        .nav-item.emer:hover { background: #fef2f2; }
        .nav-item.emer.active { background: #fef2f2; }

        .nav-badge {
          font-size: 9px; font-weight: 700;
          color: #0d9488; background: #f0fdfa;
          padding: 1px 6px; border-radius: 20px;
          border: 1px solid #ccfbf1;
          flex-shrink: 0;
        }

        /* ─── SIGN OUT BTN ─── */
        .signout-btn {
          width: 100%; padding: 9px 12px;
          background: none; border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          font-family: Inter, sans-serif; transition: all 0.15s;
        }
        .signout-btn:hover { border-color: #0d9488; color: #0d9488; }
        .signout-btn:focus { outline: 2px solid #0d9488; outline-offset: 2px; }

        /* ─── PAGE CONTENT ─── */
        .page-content { padding: 20px; flex: 1; }

        /* ═══════════════════════════════════════
           MEDIA QUERIES — Experiment 3
           Breakpoints:
             Phone  : < 600px
             Tablet : 600px – 991px
             Desktop: ≥ 992px
        ═══════════════════════════════════════ */

        /* ── DESKTOP (≥ 992px) ── */
        @media screen and (min-width: 992px) {
          .main-area.sidebar-open   { margin-left: ${SIDEBAR_WIDTH}px; }
          .main-area.sidebar-closed { margin-left: 0; }
          .page-content { padding: 24px 28px; }
          .top-bar { padding: 0 28px; }
          /* Grid helpers */
          .grid-3col { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; }
          .grid-4col { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
          .grid-2col { display: grid !important; grid-template-columns: 1fr 340px !important; }
        }

        /* ── TABLET (600px – 991px) ── */
        @media screen and (min-width: 600px) and (max-width: 991px) {
          .main-area { margin-left: 0 !important; }
          .page-content { padding: 18px 20px; }
          .grid-3col { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; }
          .grid-4col { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; }
          .grid-2col { display: grid !important; grid-template-columns: 1fr !important; }
          .hide-tablet { display: none !important; }
        }

        /* ── PHONE (< 600px) ── */
        @media screen and (max-width: 599px) {
          .main-area { margin-left: 0 !important; }
          .page-content { padding: 12px 14px; }
          .grid-3col, .grid-4col, .grid-2col {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .hide-phone { display: none !important; }
          .top-bar { padding: 0 14px; height: 52px; }
          .sidebar { width: 260px; }
          /* Stack cards on phone */
          .card-stack { flex-direction: column !important; }
          /* Bigger tap targets on phone */
          .nav-item { padding: 11px 14px; font-size: 14px; }
          .hamburger { width: 40px; height: 40px; }
        }

        /* ── REDUCED MOTION (Accessibility) ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ── PRINT STYLES ── */
        @media print {
          .sidebar, .top-bar, .hamburger, .sidebar-overlay { display: none !important; }
          .main-area { margin-left: 0 !important; }
          .page-content { padding: 0 !important; }
        }
      `}</style>

      <div className="layout-root" role="application">

        {/* ── OVERLAY (mobile/tablet when sidebar open) ── */}
        {sidebarOpen && !isDesktop && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            role="button"
            aria-label="Close sidebar"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        {/* Accessibility: role="navigation", aria-label */}
        <aside
          className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
          role="navigation"
          aria-label="Main navigation"
          aria-hidden={!sidebarOpen}
        >
          {/* Logo + close btn */}
          <div style={{ padding: '14px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.1 }}>TeleMed Connect</p>
                <p style={{ fontSize: 9, color: '#0d9488', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{portalLabel}</p>
              </div>
            </div>
            {/* Close button — visible always on mobile/tablet */}
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#374151'}
                onMouseLeave={e => e.currentTarget.style.color='#9ca3af'}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }} aria-label="Site navigation">
            {navItems.map((section, si) => (
              <div key={si} style={{ marginBottom: 4 }} className="anim-slide-left" style={{ animationDelay: `${si * 0.05}s` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 3px' }} aria-hidden="true">
                  {section.section}
                </p>
                {section.items.map((item, ii) => (
                  <Link
                    key={ii}
                    to={item.to}
                    className={`nav-item ${item.emergency ? 'emer' : ''} ${location.pathname === item.to ? 'active' : ''}`}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
                      <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span className="nav-badge" aria-label={item.badge}>{item.badge}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* User info + sign out */}
          <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 8, background: '#f9fafb', marginBottom: 8 }} aria-label="Current user">
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }} aria-hidden="true">
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {role === 'doctor' ? `Dr. ${user?.displayName}` : user?.displayName}
                </p>
                <p style={{ fontSize: 10, color: '#0d9488', fontWeight: 500, textTransform: 'capitalize' }}>{role}</p>
              </div>
            </div>
            <button className="signout-btn" onClick={handleSignOut} aria-label="Sign out of your account">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div
          className={`main-area ${sidebarOpen && isDesktop ? 'sidebar-open' : 'sidebar-closed'}`}
          role="main"
        >
          {/* Top bar */}
          <header className="top-bar" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Hamburger — Accessibility: aria-expanded, aria-controls */}
              <button
                className="hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
                aria-expanded={sidebarOpen}
                aria-controls="main-sidebar"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  {sidebarOpen && isDesktop
                    ? <path d="M6 18L18 6M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                    : <path d="M4 6h16M4 12h16M4 18h16" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                  }
                </svg>
              </button>
              <div className="anim-fade-up">
                {subtitle && <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, lineHeight: 1 }}>{subtitle}</p>}
                {title && (
                  <h1 style={{ fontSize: isPhone ? 15 : 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {title}
                  </h1>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#f0fdfa', borderRadius: 7, border: '1px solid #ccfbf1' }} aria-label="Online status: Online">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} aria-hidden="true"/>
                {!isPhone && <span style={{ fontSize: 11, color: '#0f766e', fontWeight: 600 }}>Online</span>}
              </div>
              <div
                style={{ width: 30, height: 30, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                aria-label={`User avatar for ${user?.displayName}`}
                role="img"
              >
                {initials}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="page-content" id="main-content" tabIndex={-1}>
            {/* Skip to main content — Accessibility */}
            
              href="#main-content"
              style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
              onFocus={e => { e.target.style.left = '10px'; e.target.style.top = '10px'; e.target.style.width = 'auto'; e.target.style.height = 'auto'; }}
              onBlur={e => { e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px'; }}
            >
              Skip to main content
            </a>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}