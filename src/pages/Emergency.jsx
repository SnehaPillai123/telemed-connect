import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NEARBY_HOSPITALS = [
  { name: "Apollo Hospital", dist: "1.2 km", phone: "1066", type: "Multi-speciality" },
  { name: "Fortis Healthcare", dist: "2.4 km", phone: "18001038989", type: "Emergency Care" },
  { name: "Manipal Hospital", dist: "3.1 km", phone: "08022224444", type: "Multi-speciality" },
  { name: "Columbia Asia", dist: "4.8 km", phone: "18002101111", type: "Emergency Care" },
];

const EMERGENCY_CONTACTS = [
  { name: "National Emergency", number: "112", desc: "Police, Fire, Ambulance" },
  { name: "Ambulance", number: "108", desc: "Free ambulance service" },
  { name: "Medical Helpline", number: "104", desc: "Health advice & guidance" },
  { name: "Poison Control", number: "1800116117", desc: "Poisoning emergencies" },
];

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [sosTriggered, setSosTriggered] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    if (holding) {
      const interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) { clearInterval(interval); activateSOS(); return 100; }
          return p + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    } else {
      setHoldProgress(0);
    }
  }, [holding]);

  useEffect(() => {
    if (sosActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (sosActive && countdown === 0) triggerEmergency();
  }, [sosActive, countdown]);

  const activateSOS = () => {
    setSosActive(true);
    setCountdown(5);
    setLocationStatus("getting");
    navigator.geolocation?.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus("success"); },
      () => setLocationStatus("error")
    );
  };

  const triggerEmergency = () => { setSosTriggered(true); setSosActive(false); };
  const cancelSOS = () => { setSosActive(false); setCountdown(5); setHolding(false); setHoldProgress(0); };
  const resetSOS = () => { setSosTriggered(false); setLocation(null); setLocationStatus("idle"); setHoldProgress(0); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .hospital-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .hospital-card:hover { border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.08); }
        .contact-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 16px 18px; transition: all 0.2s; }
        .contact-card:hover { border-color: #ef4444; }
        .call-btn { padding: 8px 16px; background: #0d9488; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-family: Inter, sans-serif; transition: all 0.15s; }
        .call-btn:hover { background: #0f766e; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.15s; }
        .back-link:hover { color: #0d9488; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/patient-dashboard" className="back-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <p style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>TeleMed Connect</p>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px' }}>

          {/* Title */}
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 50, padding: '6px 16px', marginBottom: 16 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '0.06em' }}>EMERGENCY SERVICES</span>
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 12 }}>Emergency SOS</h1>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
              In a medical emergency, use the SOS button below. It will share your location and alert emergency services instantly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

            {/* SOS Section */}
            <section>
              {!sosTriggered ? (
                <div style={{ background: sosActive ? '#fef2f2' : 'white', borderRadius: 16, border: `2px solid ${sosActive ? '#fecaca' : '#e5e7eb'}`, padding: '48px 32px', textAlign: 'center', marginBottom: 20, transition: 'all 0.3s' }}>
                  {sosActive ? (
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>SOS activating in...</p>
                      <div style={{ fontSize: 80, fontWeight: 900, color: '#dc2626', lineHeight: 1, marginBottom: 24 }}>{countdown}</div>
                      <p style={{ fontSize: 14, color: '#991b1b', marginBottom: 24 }}>
                        {locationStatus === 'getting' && 'Getting your location...'}
                        {locationStatus === 'success' && `Location found: ${location?.lat?.toFixed(4)}, ${location?.lng?.toFixed(4)}`}
                        {locationStatus === 'error' && 'Location unavailable — SOS will still be sent'}
                      </p>
                      <button onClick={cancelSOS} style={{ padding: '12px 32px', background: 'white', color: '#dc2626', border: '2px solid #fecaca', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Cancel SOS
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 28px' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', animation: 'pulse-ring 2s ease-out infinite' }}/>
                        <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', animation: 'pulse-ring 2s ease-out infinite 0.5s' }}/>
                        <button
                          onMouseDown={() => setHolding(true)}
                          onMouseUp={() => setHolding(false)}
                          onMouseLeave={() => setHolding(false)}
                          onTouchStart={() => setHolding(true)}
                          onTouchEnd={() => setHolding(false)}
                          aria-label="Hold to activate emergency SOS"
                          style={{ position: 'absolute', inset: 24, borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transform: holding ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.15s', overflow: 'hidden' }}>
                          {holdProgress > 0 && (
                            <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 132 132">
                              <circle cx="66" cy="66" r="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6"/>
                              <circle cx="66" cy="66" r="60" fill="none" stroke="white" strokeWidth="6"
                                strokeDasharray={`${2*Math.PI*60}`}
                                strokeDashoffset={`${2*Math.PI*60*(1-holdProgress/100)}`}
                                strokeLinecap="round"/>
                            </svg>
                          )}
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>SOS</span>
                        </button>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Hold to Activate SOS</p>
                      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Press and hold the button for 3 seconds to activate emergency mode.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="fade-up" style={{ background: '#fef2f2', borderRadius: 16, border: '2px solid #fecaca', padding: '40px 32px', textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', marginBottom: 12 }}>SOS Activated!</h2>
                  <p style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.7, marginBottom: 8 }}>Emergency alert has been sent. Nearby hospitals have been notified.</p>
                  {location && <p style={{ fontSize: 13, color: '#991b1b', marginBottom: 24 }}>Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="tel:112" style={{ padding: '12px 24px', background: '#ef4444', color: 'white', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Call 112</a>
                    <a href="tel:108" style={{ padding: '12px 24px', background: 'white', color: '#dc2626', border: '2px solid #fecaca', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Call Ambulance (108)</a>
                  </div>
                  <button onClick={resetSOS} style={{ marginTop: 20, padding: '10px 24px', background: 'none', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Reset SOS
                  </button>
                </div>
              )}

              {/* What happens */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>What happens when you activate SOS:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Your GPS location is captured instantly', 'Nearby hospitals are alerted with your location', 'Emergency contacts receive a WhatsApp message', 'Emergency helpline numbers are displayed'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#0d9488' }}>{i+1}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right side */}
            <section>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Emergency Helpline Numbers</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {EMERGENCY_CONTACTS.map((c, i) => (
                    <div key={i} className="contact-card">
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', marginBottom: 4 }}>{c.number}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{c.desc}</p>
                      <a href={`tel:${c.number}`} className="call-btn" style={{ background: '#ef4444' }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8"/></svg>
                        Call Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Nearby Hospitals</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {NEARBY_HOSPITALS.map((h, i) => (
                    <div key={i} className="hospital-card">
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{h.name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{h.type} · {h.dist}</p>
                        </div>
                      </div>
                      <a href={`tel:${h.phone}`} className="call-btn">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8"/></svg>
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
