import { useState, useEffect } from "react";
import PatientSidebar from "../components/PatientSidebar";

const HOSPITALS = [
  { name: "Apollo Hospitals", type: "Multi-speciality", rating: 4.8, beds: 500, emergency: true, distance: "1.2 km", address: "Bannerghatta Road, Bangalore", phone: "1066", specialities: ["Cardiology", "Neurology", "Oncology", "Orthopedics"] },
  { name: "Fortis Healthcare", type: "Emergency Care", rating: 4.7, beds: 300, emergency: true, distance: "2.4 km", address: "Cunningham Road, Bangalore", phone: "18001038989", specialities: ["Emergency", "Trauma", "ICU", "Surgery"] },
  { name: "Manipal Hospital", type: "Multi-speciality", rating: 4.6, beds: 650, emergency: true, distance: "3.1 km", address: "Old Airport Road, Bangalore", phone: "08022224444", specialities: ["Pediatrics", "Gynecology", "Dermatology", "ENT"] },
  { name: "Columbia Asia", type: "General Hospital", rating: 4.5, beds: 200, emergency: false, distance: "4.8 km", address: "Hebbal, Bangalore", phone: "18002101111", specialities: ["General Medicine", "Surgery", "Radiology"] },
  { name: "Narayana Health", type: "Cardiac Care", rating: 4.9, beds: 1000, emergency: true, distance: "5.2 km", address: "Hosur Road, Bangalore", phone: "18003010668", specialities: ["Cardiology", "Cardiac Surgery", "Transplant"] },
  { name: "Sakra World Hospital", type: "Multi-speciality", rating: 4.7, beds: 350, emergency: true, distance: "6.1 km", address: "Devarabeesanahalli, Bangalore", phone: "08049690000", specialities: ["Spine", "Sports Medicine", "Robotics Surgery"] },
];

export default function NearbyHospitals() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLocationStatus("getting");
    navigator.geolocation?.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus("success"); },
      () => setLocationStatus("error")
    );
  }, []);

  const filtered = filter === "emergency" ? HOSPITALS.filter(h => h.emergency) : HOSPITALS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .layout { display: flex; min-height: 100vh; background: #f9fafb; }
        .main { margin-left: 250px; flex: 1; padding: 0; }
        .hospital-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; }
        .hospital-card:hover { border-color: #0d9488; box-shadow: 0 8px 24px rgba(13,148,136,0.08); transform: translateY(-2px); }
        .call-btn { padding: 9px 16px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-family: Inter, sans-serif; transition: all 0.15s; }
        .call-btn:hover { background: #0f766e; }
        .filter-btn { padding: 7px 18px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .filter-btn:hover { border-color: #0d9488; color: #0d9488; }
        .filter-btn.active { background: #0d9488; border-color: #0d9488; color: white; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <div className="layout">
        <PatientSidebar />
        <main className="main">

          {/* Header */}
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Care</p>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Nearby Hospitals</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: locationStatus === 'success' ? '#f0fdfa' : '#f9fafb', borderRadius: 8, border: `1px solid ${locationStatus === 'success' ? '#ccfbf1' : '#e5e7eb'}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: locationStatus === 'success' ? '#10b981' : locationStatus === 'getting' ? '#f59e0b' : '#9ca3af' }}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: locationStatus === 'success' ? '#0f766e' : '#6b7280' }}>
                  {locationStatus === 'success' ? `${userLocation?.lat?.toFixed(3)}, ${userLocation?.lng?.toFixed(3)}` : locationStatus === 'getting' ? 'Getting location...' : 'Location unavailable'}
                </span>
              </div>
            </div>
          </header>

          <div style={{ padding: '28px 32px' }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Hospitals Nearby', value: HOSPITALS.length, color: '#0d9488' },
                { label: 'With Emergency', value: HOSPITALS.filter(h => h.emergency).length, color: '#dc2626' },
                { label: 'Average Distance', value: '3.8 km', color: '#2563eb' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Hospitals</button>
              <button className={`filter-btn ${filter === 'emergency' ? 'active' : ''}`} onClick={() => setFilter('emergency')}>Emergency Only</button>
            </div>

            {/* Hospital cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filtered.map((h, i) => (
                <article key={i} className="hospital-card fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: h.emergency ? '#fef2f2' : '#f0fdfa', border: `1px solid ${h.emergency ? '#fecaca' : '#ccfbf1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke={h.emergency ? '#dc2626' : '#0d9488'} strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{h.name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{h.type}</p>
                        </div>
                      </div>
                      {h.emergency && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '3px 10px', borderRadius: 20, border: '1px solid #fecaca', flexShrink: 0 }}>24/7 Emergency</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="#9ca3af" strokeWidth="1.5"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="#9ca3af" strokeWidth="1.5"/></svg>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{h.distance}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, color: '#f59e0b' }}>★</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{h.rating}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{h.beds} beds</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{h.address}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {h.specialities.slice(0, 3).map((s, j) => (
                        <span key={j} style={{ fontSize: 11, color: '#374151', background: '#f3f4f6', padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>{s}</span>
                      ))}
                      {h.specialities.length > 3 && <span style={{ fontSize: 11, color: '#9ca3af', padding: '3px 8px' }}>+{h.specialities.length - 3} more</span>}
                    </div>
                  </div>
                  <div style={{ padding: '14px 20px', display: 'flex', gap: 10 }}>
                    <a href={`tel:${h.phone}`} className="call-btn" style={{ flex: 1, justifyContent: 'center' }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8"/></svg>
                      Call Hospital
                    </a>
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + ' ' + h.address)}`} target="_blank" rel="noreferrer"
                      style={{ padding: '9px 16px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#0d9488'; e.currentTarget.style.color='#0d9488'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#374151'; }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.8"/></svg>
                      Directions
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}