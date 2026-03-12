import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .dash-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .dash-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { transform: translateX(4px); }
        .stat-card { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%)',
          padding: '48px 32px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 300, height: 300,
            borderRadius: '50%', background: 'rgba(13,148,136,0.15)'
          }}/>
          <div style={{
            position: 'absolute', bottom: -80, left: '40%', width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
          }}/>
          <div className="max-w-7xl mx-auto" style={{ position: 'relative' }}>
            <p style={{ color: '#94a3b8', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {greeting}
            </p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 36, fontWeight: 400, margin: '0 0 6px' }}>
              {user?.displayName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>
              Your health dashboard — everything in one place.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto" style={{ padding: '32px' }}>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Upcoming Appointments', value: '0', color: '#0d9488', bg: '#f0fdfa' },
              { label: 'Active Prescriptions', value: '0', color: '#0284c7', bg: '#f0f9ff' },
              { label: 'Medical Records', value: '0', color: '#7c3aed', bg: '#faf5ff' },
            ].map((stat, i) => (
              <div key={i} className="stat-card dash-card" style={{
                background: 'white', borderRadius: 16, padding: '24px 28px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${stat.color}`
              }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{stat.label}</p>
                <p style={{ fontSize: 40, fontWeight: 300, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Quick Actions */}
            <div className="dash-card" style={{
              background: 'white', borderRadius: 16, padding: 28,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { to: '/search-doctors', label: 'Find a Specialist', desc: 'Search and book consultations', color: '#0d9488' },
                  { to: '/my-appointments', label: 'My Appointments', desc: 'View and manage bookings', color: '#0284c7' },             
                  { to: '/edit-profile', label: 'Edit Profile', desc: 'Update personal information', color: '#7c3aed' },
                ].map((item, i) => (
                  <Link key={i} to={item.to} className="action-btn" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: 12,
                    background: '#f8fafc', textDecoration: 'none',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</p>
                    </div>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" stroke={item.color} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="dash-card" style={{
              background: 'white', borderRadius: 16, padding: 28,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>
                Recent Appointments
              </h3>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 160, gap: 12
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                  No appointments yet.<br/>
                  <Link to="/search-doctors" style={{ color: '#0d9488', fontWeight: 500 }}>
                    Book your first consultation
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
