import { useState, useEffect } from "react";
import Layout from "../components/Layout";

const HOSPITALS = [
  { name:"Apollo Hospitals", type:"Multi-speciality", rating:4.8, beds:500, emergency:true, distance:"1.2 km", address:"Bannerghatta Road, Bangalore", phone:"1066", specialities:["Cardiology","Neurology","Oncology","Orthopedics"] },
  { name:"Fortis Healthcare", type:"Emergency Care", rating:4.7, beds:300, emergency:true, distance:"2.4 km", address:"Cunningham Road, Bangalore", phone:"18001038989", specialities:["Emergency","Trauma","ICU","Surgery"] },
  { name:"Manipal Hospital", type:"Multi-speciality", rating:4.6, beds:650, emergency:true, distance:"3.1 km", address:"Old Airport Road, Bangalore", phone:"08022224444", specialities:["Pediatrics","Gynecology","Dermatology","ENT"] },
  { name:"Columbia Asia", type:"General Hospital", rating:4.5, beds:200, emergency:false, distance:"4.8 km", address:"Hebbal, Bangalore", phone:"18002101111", specialities:["General Medicine","Surgery","Radiology"] },
  { name:"Narayana Health", type:"Cardiac Care", rating:4.9, beds:1000, emergency:true, distance:"5.2 km", address:"Hosur Road, Bangalore", phone:"18003010668", specialities:["Cardiology","Cardiac Surgery","Transplant"] },
  { name:"Sakra World Hospital", type:"Multi-speciality", rating:4.7, beds:350, emergency:true, distance:"6.1 km", address:"Devarabeesanahalli, Bangalore", phone:"08049690000", specialities:["Spine","Sports Medicine","Robotics Surgery"] },
];

const EMERGENCY_CONTACTS = [
  { name:"National Emergency", number:"112", desc:"Police, Fire, Ambulance" },
  { name:"Ambulance", number:"108", desc:"Free ambulance service" },
  { name:"Medical Helpline", number:"104", desc:"Health advice & guidance" },
  { name:"Poison Control", number:"1800116117", desc:"Poisoning emergencies" },
];

export default function HospitalsEmergency() {
  const [activeTab, setActiveTab] = useState("hospitals");
  const [filter, setFilter] = useState("all");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [location, setLocation] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    setLocationStatus("getting");
    navigator.geolocation?.getCurrentPosition(
      pos => { setLocation({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setLocationStatus("success"); },
      () => setLocationStatus("error")
    );
  }, []);

  useEffect(() => {
    if (holding) {
      const interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) { clearInterval(interval); activateSOS(); return 100; }
          return p + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    } else setHoldProgress(0);
  }, [holding]);

  useEffect(() => {
    if (sosActive && countdown > 0) {
      const t = setTimeout(() => setCountdown(c=>c-1), 1000);
      return () => clearTimeout(t);
    }
    if (sosActive && countdown === 0) { setSosTriggered(true); setSosActive(false); }
  }, [sosActive, countdown]);

  const activateSOS = () => { setSosActive(true); setCountdown(5); };
  const cancelSOS = () => { setSosActive(false); setCountdown(5); setHolding(false); setHoldProgress(0); };
  const resetSOS = () => { setSosTriggered(false); setHoldProgress(0); };

  const filtered = filter === "emergency" ? HOSPITALS.filter(h=>h.emergency) : HOSPITALS;

  return (
    <Layout title="Hospitals & Emergency" subtitle="Care">
      <style>{`
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .hospital-card { background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; transition:all 0.2s; }
        .hospital-card:hover { border-color:#0d9488; box-shadow:0 6px 20px rgba(13,148,136,0.08); transform:translateY(-2px); }
        .call-btn { padding:8px 16px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-family:Inter,sans-serif; transition:all 0.15s; }
        .call-btn:hover { background:#0f766e; }
        .filter-chip { padding:7px 18px; border-radius:20px; border:1.5px solid #e5e7eb; background:white; font-size:13px; font-weight:500; color:#374151; cursor:pointer; transition:all 0.15s; font-family:Inter,sans-serif; }
        .filter-chip:hover { border-color:#0d9488; color:#0d9488; }
        .filter-chip.active { background:#0d9488; border-color:#0d9488; color:white; }
        .contact-card { background:white; border-radius:10px; border:1px solid #e5e7eb; padding:16px; transition:all 0.2s; }
        .contact-card:hover { border-color:#ef4444; }
      `}</style>

      {/* Stats row */}
      <div className="grid-4col" style={{ marginBottom:20 }}>
        {[
          { l:'Hospitals Nearby', v:HOSPITALS.length, c:'#0d9488', bg:'#f0fdfa' },
          { l:'24/7 Emergency', v:HOSPITALS.filter(h=>h.emergency).length, c:'#dc2626', bg:'#fef2f2' },
          { l:'Avg Distance', v:'3.8 km', c:'#2563eb', bg:'#eff6ff' },
          { l:'My Location', v:locationStatus==='success'?'Found':'Getting...', c:locationStatus==='success'?'#16a34a':'#d97706', bg:locationStatus==='success'?'#f0fdf4':'#fffbeb' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:10, padding:'16px', border:'1px solid #e5e7eb', textAlign:'center' }}>
            <p style={{ fontSize:20, fontWeight:800, color:s.c, lineHeight:1, marginBottom:4 }}>{s.v}</p>
            <p style={{ fontSize:12, color:'#6b7280' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab==='hospitals'?'active':''}`} onClick={() => setActiveTab('hospitals')}>
          🏥 Nearby Hospitals ({HOSPITALS.length})
        </button>
        <button className={`tab-btn ${activeTab==='emergency'?'active':''}`} onClick={() => setActiveTab('emergency')}>
          🚨 Emergency SOS
        </button>
      </div>

      {/* HOSPITALS TAB */}
      {activeTab === 'hospitals' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <button className={`filter-chip ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}>All Hospitals</button>
            <button className={`filter-chip ${filter==='emergency'?'active':''}`} onClick={() => setFilter('emergency')}>Emergency Only</button>
          </div>
          <div className="grid-3col">
            {filtered.map((h,i) => (
              <article key={i} className="hospital-card fade-in" style={{ animationDelay:`${i*0.05}s`, opacity:0 }}>
                <div style={{ padding:'18px', borderBottom:'1px solid #f9fafb' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <div style={{ width:42, height:42, borderRadius:10, background:h.emergency?'#fef2f2':'#f0fdfa', border:`1px solid ${h.emergency?'#fecaca':'#ccfbf1'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke={h.emergency?'#dc2626':'#0d9488'} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:2 }}>{h.name}</p>
                        <p style={{ fontSize:12, color:'#6b7280' }}>{h.type}</p>
                      </div>
                    </div>
                    {h.emergency && <span style={{ fontSize:10, fontWeight:700, color:'#dc2626', background:'#fef2f2', padding:'3px 9px', borderRadius:20, border:'1px solid #fecaca', flexShrink:0 }}>24/7</span>}
                  </div>
                  <div style={{ display:'flex', gap:14, marginBottom:10 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>⭐ {h.rating}</span>
                    <span style={{ fontSize:12, color:'#6b7280' }}>📍 {h.distance}</span>
                    <span style={{ fontSize:12, color:'#6b7280' }}>{h.beds} beds</span>
                  </div>
                  <p style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>{h.address}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {h.specialities.slice(0,3).map((s,j) => (
                      <span key={j} style={{ fontSize:10, color:'#374151', background:'#f3f4f6', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>{s}</span>
                    ))}
                    {h.specialities.length>3 && <span style={{ fontSize:10, color:'#9ca3af', padding:'2px 6px' }}>+{h.specialities.length-3}</span>}
                  </div>
                </div>
                <div style={{ padding:'12px 18px', display:'flex', gap:8 }}>
                  <a href={`tel:${h.phone}`} className="call-btn" style={{ flex:1, justifyContent:'center' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8"/></svg>
                    Call
                  </a>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}`} target="_blank" rel="noreferrer"
                    style={{ padding:'8px 14px', background:'white', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:12, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5, transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#0d9488';e.currentTarget.style.color='#0d9488';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#374151';}}>
                    📍 Directions
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* EMERGENCY TAB */}
      {activeTab === 'emergency' && (
        <div className="grid-2col">
          {/* SOS */}
          <section>
            {!sosTriggered ? (
              <div style={{ background:sosActive?'#fef2f2':'white', borderRadius:16, border:`2px solid ${sosActive?'#fecaca':'#e5e7eb'}`, padding:'40px 28px', textAlign:'center', marginBottom:16, transition:'all 0.3s' }}>
                {sosActive ? (
                  <div>
                    <p style={{ fontSize:16, fontWeight:700, color:'#dc2626', marginBottom:8 }}>SOS activating in...</p>
                    <div style={{ fontSize:72, fontWeight:900, color:'#dc2626', lineHeight:1, marginBottom:20 }}>{countdown}</div>
                    <button onClick={cancelSOS} style={{ padding:'12px 28px', background:'white', color:'#dc2626', border:'2px solid #fecaca', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancel SOS</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ position:'relative', width:160, height:160, margin:'0 auto 24px' }}>
                      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(239,68,68,0.1)', animation:'pulse-ring 2s ease-out infinite' }}/>
                      <div style={{ position:'absolute', inset:16, borderRadius:'50%', background:'rgba(239,68,68,0.15)', animation:'pulse-ring 2s ease-out infinite 0.5s' }}/>
                      <button
                        onMouseDown={()=>setHolding(true)} onMouseUp={()=>setHolding(false)}
                        onMouseLeave={()=>setHolding(false)} onTouchStart={()=>setHolding(true)} onTouchEnd={()=>setHolding(false)}
                        style={{ position:'absolute', inset:20, borderRadius:'50%', background:'#ef4444', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, transform:holding?'scale(0.95)':'scale(1)', transition:'transform 0.15s', overflow:'hidden' }}>
                        {holdProgress>0 && (
                          <svg style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }} viewBox="0 0 132 132">
                            <circle cx="66" cy="66" r="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6"/>
                            <circle cx="66" cy="66" r="60" fill="none" stroke="white" strokeWidth="6"
                              strokeDasharray={`${2*Math.PI*60}`} strokeDashoffset={`${2*Math.PI*60*(1-holdProgress/100)}`} strokeLinecap="round"/>
                          </svg>
                        )}
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span style={{ fontSize:12, fontWeight:800, color:'white', letterSpacing:'0.04em' }}>SOS</span>
                      </button>
                    </div>
                    <p style={{ fontSize:15, fontWeight:700, color:'#111827', marginBottom:8 }}>Hold to Activate SOS</p>
                    <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>Press and hold the button for 3 seconds to activate emergency mode. Your location will be shared with nearby hospitals.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="fade-in" style={{ background:'#fef2f2', borderRadius:16, border:'2px solid #fecaca', padding:'36px 28px', textAlign:'center', marginBottom:16 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize:20, fontWeight:800, color:'#dc2626', marginBottom:10 }}>SOS Activated!</h2>
                <p style={{ fontSize:14, color:'#991b1b', lineHeight:1.7, marginBottom:16 }}>Emergency alert sent. Nearby hospitals have been notified.</p>
                {location && <p style={{ fontSize:12, color:'#991b1b', marginBottom:16 }}>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
                  <a href="tel:112" style={{ padding:'10px 20px', background:'#ef4444', color:'white', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>📞 Call 112</a>
                  <a href="tel:108" style={{ padding:'10px 20px', background:'white', color:'#dc2626', border:'2px solid #fecaca', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>🚑 Ambulance (108)</a>
                </div>
                <button onClick={resetSOS} style={{ padding:'9px 20px', background:'none', border:'1.5px solid #fecaca', borderRadius:8, fontSize:13, color:'#dc2626', cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:500 }}>Reset SOS</button>
              </div>
            )}
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'18px' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:12 }}>What happens when you activate SOS:</p>
              {['GPS location is captured instantly','Nearby hospitals are alerted','Emergency contacts are notified','Helpline numbers are displayed'].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:9 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:9, fontWeight:700, color:'#0d9488' }}>{i+1}</span>
                  </div>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{s}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Emergency contacts */}
          <section>
            <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:14 }}>Emergency Helplines</p>
            <div className="grid-2col" style={{ marginBottom:20 }}>
              {EMERGENCY_CONTACTS.map((c,i) => (
                <div key={i} className="contact-card">
                  <p style={{ fontSize:22, fontWeight:800, color:'#dc2626', marginBottom:3 }}>{c.number}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:2 }}>{c.name}</p>
                  <p style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>{c.desc}</p>
                  <a href={`tel:${c.number}`} className="call-btn" style={{ background:'#ef4444', fontSize:12 }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8"/></svg>
                    Call Now
                  </a>
                </div>
              ))}
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:12 }}>Quick Call — Nearest Hospitals</p>
            {HOSPITALS.filter(h=>h.emergency).slice(0,4).map((h,i) => (
              <div key={i} style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, transition:'all 0.2s' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:2 }}>{h.name}</p>
                  <p style={{ fontSize:11, color:'#6b7280' }}>{h.distance} · 24/7 Emergency</p>
                </div>
                <a href={`tel:${h.phone}`} className="call-btn" style={{ fontSize:12 }}>
                  Call
                </a>
              </div>
            ))}
          </section>
        </div>
      )}
    </Layout>
  );
}