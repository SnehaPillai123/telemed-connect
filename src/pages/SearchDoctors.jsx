import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const SPECIALIZATIONS = ["All","General Physician","Cardiologist","Dermatologist",
  "Neurologist","Orthopedic","Pediatrician","Psychiatrist","Gynecologist",
  "Ophthalmologist","ENT Specialist","Pulmonologist"];
const EXPERIENCE_OPTIONS = ["Any","1-3 years","3-5 years","5-10 years","10+ years"];
const FEE_OPTIONS = ["Any","Under ₹300","₹300-₹500","₹500-₹1000","Above ₹1000"];
const RATING_OPTIONS = ["Any","4.0+","4.5+","4.8+"];

function DoctorModal({ doctor, onClose, onBook }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeInBg { from{opacity:0} to{opacity:1} }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; justify-content:flex-end; animation:fadeInBg 0.2s ease; backdrop-filter:blur(3px); }
        .modal-panel { width:420px; max-width:100vw; background:white; height:100vh; overflow-y:auto; animation:slideInRight 0.3s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; }
        .modal-close { position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.2); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:white; font-size:18px; transition:background 0.15s; }
        .modal-close:hover { background:rgba(255,255,255,0.35); }
        .info-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; background:#f0fdfa; border:1px solid #ccfbf1; font-size:13px; color:#0d9488; font-weight:500; }
        @media screen and (max-width:480px) { .modal-panel { width:100vw; } }
      `}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel" onClick={e => e.stopPropagation()}>
          <div style={{ background:'linear-gradient(135deg,#0d9488,#0284c7)', padding:'28px 24px 24px', position:'relative', flexShrink:0 }}>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ width:64, height:64, borderRadius:16, background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:22, fontWeight:800, color:'white' }}>
                  {doctor.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
                </span>
              </div>
              <div>
                <p style={{ fontSize:20, fontWeight:800, color:'white', marginBottom:4 }}>Dr. {doctor.fullName}</p>
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.9)', background:'rgba(255,255,255,0.2)', padding:'3px 12px', borderRadius:20 }}>
                  {doctor.specialization}
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding:'20px 24px', flex:1 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
              {[
                { label:'Experience', value:`${doctor.experience||'—'} yrs` },
                { label:'Rating', value:`${doctor.rating||'4.5'} ★` },
                { label:'Fee', value:`₹${doctor.consultationFee||'—'}` },
              ].map((s,i) => (
                <div key={i} style={{ textAlign:'center', padding:'12px 8px', background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb' }}>
                  <p style={{ fontSize:18, fontWeight:800, color:'#0d9488', lineHeight:1, marginBottom:4 }}>{s.value}</p>
                  <p style={{ fontSize:11, color:'#6b7280' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'#f0fdf4', borderRadius:20, border:'1px solid #bbf7d0' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981' }}/>
                <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>Available Now</span>
              </div>
              <div className="info-chip">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#0d9488" strokeWidth="1.5"/></svg>
                Verified Doctor
              </div>
            </div>
            {doctor.bio && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:8 }}>About</p>
                <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{doctor.bio}</p>
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:10 }}>Details</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Specialization', value:doctor.specialization||'—' },
                  { label:'License No.', value:doctor.licenseNumber||'Verified' },
                  { label:'Consultation Fee', value:`₹${doctor.consultationFee||'—'} per session` },
                  { label:'Experience', value:`${doctor.experience||'—'} years` },
                  { label:'Language', value:doctor.preferredLanguage||'English, Hindi' },
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 12px', background:'#f9fafb', borderRadius:8, gap:12 }}>
                    <p style={{ fontSize:12, color:'#6b7280' }}>{item.label}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:'#111827', textAlign:'right' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#f0fdfa', borderRadius:10, padding:16, border:'1px solid #ccfbf1', marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#0d9488', marginBottom:8 }}>What to Expect</p>
              {['Online consultation via our platform','Digital prescription after consultation','Follow-up support available','Medicine order links provided'].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/></svg>
                  <p style={{ fontSize:12, color:'#374151' }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:'16px 24px', borderTop:'1px solid #e5e7eb', flexShrink:0, display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'11px', background:'white', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Back
            </button>
            <button onClick={() => onBook(doctor.id)} style={{ flex:2, padding:'11px', background:'#0d9488', color:'white', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Book — ₹{doctor.consultationFee||'—'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── DROPDOWN FILTER CHIP ────────────────────────────────
function FilterChip({ label, icon, options, value, onChange, color = "#0d9488" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = value !== options[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative', flexShrink:0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display:'inline-flex', alignItems:'center', gap:6,
          padding:'8px 14px', borderRadius:50,
          border:`1.5px solid ${isActive ? color : '#e5e7eb'}`,
          background: isActive ? color : 'white',
          color: isActive ? 'white' : '#374151',
          fontSize:13, fontWeight:600, cursor:'pointer',
          fontFamily:'Inter,sans-serif', transition:'all 0.2s',
          whiteSpace:'nowrap',
          boxShadow: isActive ? `0 2px 8px ${color}40` : 'none',
        }}>
        <span>{icon}</span>
        <span>{isActive ? value : label}</span>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', left:0,
          background:'white', borderRadius:12, border:'1px solid #e5e7eb',
          boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:100,
          minWidth:180, overflow:'hidden', padding:'6px',
        }}>
          {options.map((opt) => (
            <button key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'9px 12px', border:'none', borderRadius:8,
                background: value===opt ? `${color}15` : 'transparent',
                color: value===opt ? color : '#374151',
                fontSize:13, fontWeight: value===opt ? 700 : 500,
                cursor:'pointer', fontFamily:'Inter,sans-serif',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { if(value!==opt) e.target.style.background='#f9fafb'; }}
              onMouseLeave={e => { if(value!==opt) e.target.style.background='transparent'; }}>
              {value===opt && <span style={{ marginRight:6 }}>✓</span>}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [experience, setExperience] = useState("Any");
  const [fee, setFee] = useState("Any");
  const [rating, setRating] = useState("Any");
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const snap = await getDocs(collection(db, "doctors"));
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() })).filter(d => d.specialization);
      setDoctors(data); setFiltered(data); setLoading(false);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = [...doctors];
    if (activeSpec !== "All") result = result.filter(d => d.specialization === activeSpec);
    if (search.trim()) result = result.filter(d =>
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()));
    if (experience !== "Any") {
      result = result.filter(d => {
        const exp = parseInt(d.experience) || 0;
        if (experience === "1-3 years") return exp >= 1 && exp <= 3;
        if (experience === "3-5 years") return exp >= 3 && exp <= 5;
        if (experience === "5-10 years") return exp >= 5 && exp <= 10;
        if (experience === "10+ years") return exp >= 10;
        return true;
      });
    }
    if (fee !== "Any") {
      result = result.filter(d => {
        const f = parseInt(d.consultationFee) || 0;
        if (fee === "Under ₹300") return f < 300;
        if (fee === "₹300-₹500") return f >= 300 && f <= 500;
        if (fee === "₹500-₹1000") return f >= 500 && f <= 1000;
        if (fee === "Above ₹1000") return f > 1000;
        return true;
      });
    }
    if (rating !== "Any") {
      result = result.filter(d => {
        const r = parseFloat(d.rating) || 0;
        if (rating === "4.0+") return r >= 4.0;
        if (rating === "4.5+") return r >= 4.5;
        if (rating === "4.8+") return r >= 4.8;
        return true;
      });
    }
    setFiltered(result);
  }, [search, activeSpec, experience, fee, rating, doctors]);

  const clearFilters = () => { setActiveSpec("All"); setExperience("Any"); setFee("Any"); setRating("Any"); setSearch(""); };
  const hasFilters = activeSpec!=="All" || experience!=="Any" || fee!=="Any" || rating!=="Any" || search;

  return (
    <Layout title="Find a Doctor" subtitle="Search Doctors">
      <style>{`
        .doctor-card { background:white; border-radius:14px; border:1px solid #e5e7eb; overflow:hidden; transition:all 0.25s; cursor:pointer; }
        .doctor-card:hover { border-color:#0d9488; box-shadow:0 12px 32px rgba(13,148,136,0.12); transform:translateY(-4px); }
        .book-btn { width:100%; padding:10px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:Inter,sans-serif; }
        .book-btn:hover { background:#0f766e; }
        .preview-btn { width:100%; padding:9px; background:white; color:#0d9488; border:1.5px solid #ccfbf1; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:Inter,sans-serif; }
        .preview-btn:hover { background:#f0fdfa; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.3s ease forwards; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Filter bar scrollable on mobile */
        .filter-bar { display:flex; align-items:center; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; }
        .filter-bar::-webkit-scrollbar { display:none; }
      `}</style>

      {selectedDoctor && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onBook={(id) => { setSelectedDoctor(null); navigate(`/book/${id}`); }}
        />
      )}

      {/* ── SEARCH BAR ── */}
      <div style={{ position:'relative', marginBottom:14 }}>
        <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
          width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialization..."
          style={{ width:'100%', padding:'12px 14px 12px 44px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, color:'#111827', background:'white', outline:'none', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}
          onFocus={e => e.target.style.borderColor='#0d9488'}
          onBlur={e => e.target.style.borderColor='#e5e7eb'}
        />
      </div>

      {/* ── FILTER CHIPS BAR ── */}
      <div className="filter-bar" style={{ marginBottom:20 }}>
        <FilterChip
          label="Specialization"
          icon="🩺"
          options={SPECIALIZATIONS}
          value={activeSpec}
          onChange={setActiveSpec}
          color="#0d9488"
        />
        <FilterChip
          label="Experience"
          icon="⏱️"
          options={EXPERIENCE_OPTIONS}
          value={experience}
          onChange={setExperience}
          color="#2563eb"
        />
        <FilterChip
          label="Fee Range"
          icon="💰"
          options={FEE_OPTIONS}
          value={fee}
          onChange={setFee}
          color="#7c3aed"
        />
        <FilterChip
          label="Rating"
          icon="⭐"
          options={RATING_OPTIONS}
          value={rating}
          onChange={setRating}
          color="#d97706"
        />

        {/* Clear all */}
        {hasFilters && (
          <button onClick={clearFilters}
            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:50, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── ACTIVE FILTER TAGS ── */}
      {hasFilters && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {activeSpec!=="All" && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:20, fontSize:12, color:'#0d9488', fontWeight:600 }}>
              🩺 {activeSpec}
              <button onClick={() => setActiveSpec("All")} style={{ background:'none', border:'none', cursor:'pointer', color:'#0d9488', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
            </span>
          )}
          {experience!=="Any" && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:20, fontSize:12, color:'#2563eb', fontWeight:600 }}>
              ⏱️ {experience}
              <button onClick={() => setExperience("Any")} style={{ background:'none', border:'none', cursor:'pointer', color:'#2563eb', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
            </span>
          )}
          {fee!=="Any" && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:20, fontSize:12, color:'#7c3aed', fontWeight:600 }}>
              💰 {fee}
              <button onClick={() => setFee("Any")} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
            </span>
          )}
          {rating!=="Any" && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:20, fontSize:12, color:'#d97706', fontWeight:600 }}>
              ⭐ {rating}
              <button onClick={() => setRating("Any")} style={{ background:'none', border:'none', cursor:'pointer', color:'#d97706', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* ── RESULTS COUNT ── */}
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'#111827' }}>
          {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length!==1?'s':''} found`}
        </p>
        <p style={{ fontSize:12, color:'#9ca3af' }}>Click any card to preview full profile</p>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div style={{ width:32, height:32, border:'3px solid #e5e7eb', borderTopColor:'#0d9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && filtered.length === 0 && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'60px', textAlign:'center' }}>
          <p style={{ fontSize:15, fontWeight:600, color:'#374151', marginBottom:6 }}>No doctors found</p>
          <p style={{ fontSize:13, color:'#9ca3af', marginBottom:16 }}>Try adjusting your filters</p>
          <button onClick={clearFilters} style={{ padding:'9px 20px', background:'#0d9488', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* ── DOCTOR CARDS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:14 }}>
        {filtered.map((doc, i) => (
          <article key={doc.id} className="doctor-card fade-in"
            style={{ animationDelay:`${i*0.04}s`, opacity:0 }}
            onClick={() => setSelectedDoctor(doc)}>
            <div style={{ padding:'18px 18px 14px', borderBottom:'1px solid #f9fafb' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#f0fdfa,#e0f2fe)', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:15, fontWeight:800, color:'#0d9488' }}>
                    {doc.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
                  </span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:4 }}>Dr. {doc.fullName}</p>
                  <span style={{ fontSize:11, fontWeight:600, color:'#0d9488', background:'#f0fdfa', padding:'2px 9px', borderRadius:20, border:'1px solid #ccfbf1' }}>{doc.specialization}</span>
                </div>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', flexShrink:0, marginTop:4 }}/>
              </div>
              {doc.bio && (
                <p style={{ fontSize:11, color:'#9ca3af', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {doc.bio}
                </p>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {[
                  { l:'Exp', v:`${doc.experience||'—'}yr` },
                  { l:'Rating', v:doc.rating||'4.5' },
                  { l:'Fee', v:`₹${doc.consultationFee||'—'}` }
                ].map((s,i) => (
                  <div key={i} style={{ textAlign:'center', padding:'8px 4px', background:'#f9fafb', borderRadius:7 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:i===2?'#0d9488':'#111827', marginBottom:1 }}>{s.v}</p>
                    <p style={{ fontSize:9, color:'#9ca3af' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:'12px 18px', display:'flex', gap:8 }}>
              <button className="preview-btn" onClick={e => { e.stopPropagation(); setSelectedDoctor(doc); }}>
                View Profile
              </button>
              <button className="book-btn" onClick={e => { e.stopPropagation(); navigate(`/book/${doc.id}`); }}>
                Book
              </button>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
