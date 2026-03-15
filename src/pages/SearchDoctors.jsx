import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import PatientSidebar from "../components/PatientSidebar";
import { useNavigate } from "react-router-dom";

const SPECIALIZATIONS = ["All", "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist", "ENT Specialist", "Pulmonologist"];
const EXPERIENCE_OPTIONS = ["Any", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const FEE_OPTIONS = ["Any", "Under ₹300", "₹300-₹500", "₹500-₹1000", "Above ₹1000"];

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [experience, setExperience] = useState("Any");
  const [fee, setFee] = useState("Any");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const snap = await getDocs(collection(db, "doctors"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.specialization);
      setDoctors(data); setFiltered(data); setLoading(false);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = [...doctors];
    if (activeSpec !== "All") result = result.filter(d => d.specialization === activeSpec);
    if (search.trim()) result = result.filter(d => d.fullName?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()));
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
    setFiltered(result);
  }, [search, activeSpec, experience, fee, doctors]);

  const clearFilters = () => { setActiveSpec("All"); setExperience("Any"); setFee("Any"); setSearch(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .filter-btn { width: 100%; text-align: left; padding: 8px 12px; border-radius: 7px; border: 1px solid transparent; background: none; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .filter-btn:hover { background: #f0fdfa; color: #0d9488; }
        .filter-btn.active { background: #f0fdfa; color: #0d9488; font-weight: 600; border-color: #ccfbf1; }
        .doctor-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; }
        .doctor-card:hover { border-color: #0d9488; box-shadow: 0 8px 24px rgba(13,148,136,0.1); transform: translateY(-2px); }
        .book-btn { width: 100%; padding: 10px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; }
        .book-btn:hover { background: #0f766e; }
        .search-input { width: 100%; padding: 10px 14px 10px 38px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .search-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .filter-label { font-size: 10px; font-weight: 700; color: '#374151'; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display: block; color: #9ca3af; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <PatientSidebar />

        {/* Filters panel */}
        <aside style={{ width: 220, background: 'white', borderRight: '1px solid #e5e7eb', position: 'fixed', left: 250, top: 0, height: '100vh', overflowY: 'auto', padding: '20px 12px', zIndex: 40 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, padding: '0 4px' }}>Filters</p>

          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="filter-label">Specialization</span>
            {SPECIALIZATIONS.map(s => (
              <button key={s} className={`filter-btn ${activeSpec === s ? 'active' : ''}`} onClick={() => setActiveSpec(s)}>{s}</button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="filter-label">Experience</span>
            {EXPERIENCE_OPTIONS.map(e => (
              <button key={e} className={`filter-btn ${experience === e ? 'active' : ''}`} onClick={() => setExperience(e)}>{e}</button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="filter-label">Fee Range</span>
            {FEE_OPTIONS.map(f => (
              <button key={f} className={`filter-btn ${fee === f ? 'active' : ''}`} onClick={() => setFee(f)}>{f}</button>
            ))}
          </div>

          {(activeSpec !== 'All' || experience !== 'Any' || fee !== 'Any' || search) && (
            <button onClick={clearFilters} style={{ width: '100%', padding: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Clear Filters
            </button>
          )}
        </aside>

        {/* Results */}
        <main style={{ marginLeft: 470, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em', marginBottom: 4 }}>Find a Doctor</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
              {activeSpec !== 'All' && ` · ${activeSpec}`}
            </p>
          </header>

          <div style={{ padding: '28px 32px', flex: 1 }}>
            {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/></div>}

            {!loading && filtered.length === 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No doctors found</p>
                <button onClick={clearFilters} style={{ padding: '9px 20px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Clear Filters</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {filtered.map((doc, i) => (
                <article key={doc.id} className="doctor-card fade-in" style={{ animationDelay: `${i*0.04}s`, opacity: 0 }}>
                  <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0d9488' }}>
                          {doc.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Dr. {doc.fullName}</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '2px 9px', borderRadius: 20, border: '1px solid #ccfbf1' }}>{doc.specialization}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}/>
                        <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>Online</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                      {[{ l: 'Exp', v: `${doc.experience || '—'}yr` }, { l: 'Rating', v: doc.rating || '4.5' }, { l: 'Fee', v: `₹${doc.consultationFee || '—'}` }].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: '#f9fafb', borderRadius: 6 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: i === 2 ? '#0d9488' : '#111827', marginBottom: 1 }}>{s.v}</p>
                          <p style={{ fontSize: 9, color: '#9ca3af', fontWeight: 500 }}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '12px 18px' }}>
                    <button className="book-btn" onClick={() => navigate(`/book/${doc.id}`)}>Book Consultation</button>
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
