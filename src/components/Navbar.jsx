import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const patientLinks = [
    { to: '/patient-dashboard', label: 'Dashboard' },
    { to: '/search-doctors', label: 'Find Doctors' },
    { to: '/my-appointments', label: 'Appointments' },
    { to: '/symptom-checker', label: 'Symptom Checker' },
    { to: '/my-prescriptions', label: 'Prescriptions' },
  ];

  const doctorLinks = [
    { to: '/doctor-dashboard', label: 'Dashboard' },
    { to: '/doctor-appointments', label: 'Appointments' },
    { to: '/edit-profile', label: 'Profile' },
  ];

  const navLinks = role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <>
      <style>{`
        .navbar-nav { list-style: none; display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; }
        .nav-item a { font-size: 13px; font-weight: 500; color: #374151; text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: all 0.15s; display: block; }
        .nav-item a:hover { background: #f0fdfa; color: #0d9488; }
        .nav-item a.active { background: #f0fdfa; color: #0d9488; font-weight: 600; }
        .signout-btn { padding: 7px 16px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .signout-btn:hover { border-color: #0d9488; color: #0d9488; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #374151; border-radius: 2px; transition: all 0.2s; }
        .mobile-menu { display: none; position: absolute; top: 60px; left: 0; right: 0; background: white; border-bottom: 1px solid #e5e7eb; padding: 12px 20px; flex-direction: column; gap: 4px; z-index: 99; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; padding: 10px 12px; border-radius: 8px; transition: all 0.15s; }
        .mobile-menu a:hover { background: #f0fdfa; color: #0d9488; }
        @media screen and (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .hamburger { display: flex !important; }
          .nav-user-info span { display: none; }
        }
      `}</style>

      {/* Semantic header tag — Experiment 1 */}
      <header role="banner" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Semantic nav tag — Experiment 1 */}
        <nav role="navigation" aria-label="Main navigation" style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', maxWidth: '100%' }}>

          {/* Logo */}
          <Link to={role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
            aria-label="TeleMed Connect - Go to dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.2 }}>TeleMed Connect</p>
              <p style={{ fontSize: 10, color: '#0d9488', margin: 0, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Healthcare Platform</p>
            </div>
          </Link>

          {/* Desktop nav links — using semantic ul/li */}
          <ul className="navbar-nav nav-desktop-links" role="menubar" aria-label="Site navigation">
            {navLinks.map((link, i) => (
              <li key={i} className="nav-item" role="none">
                <Link
                  to={link.to}
                  role="menuitem"
                  className={location.pathname === link.to ? 'active' : ''}
                  aria-current={location.pathname === link.to ? 'page' : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

            {/* Online indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdfa', borderRadius: 6, border: '1px solid #ccfbf1' }} aria-label="Status: Online">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} aria-hidden="true"/>
              <span style={{ fontSize: 12, color: '#0f766e', fontWeight: 500 }}>Online</span>
            </div>

            {/* User info */}
            <div className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                aria-label={`User: ${user?.displayName}`}>
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>{user?.displayName}</span>
                <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 500 }}>{role === 'doctor' ? 'Medical Professional' : 'Patient'}</span>
              </div>
            </div>

            <button className="signout-btn no-print" onClick={handleSignOut} aria-label="Sign out of your account">
              Sign out
            </button>

            {/* Hamburger for mobile */}
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="menu" aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link key={i} to={link.to} role="menuitem"
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: location.pathname === link.to ? 600 : 500, color: location.pathname === link.to ? '#0d9488' : '#374151' }}>
              {link.label}
            </Link>
          ))}
          <button onClick={handleSignOut} style={{ marginTop: 8, padding: '10px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
            Sign out
          </button>
        </div>
      </header>
    </>
  );
}
