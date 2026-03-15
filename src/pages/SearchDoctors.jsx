import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const SPECIALIZATIONS = ["All", "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist", "ENT Specialist"];

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "doctors"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.specialization);
      setDoctors(data);
      setFiltered(data);
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = doctors;
    if (activeSpec !== "All") result = result.filter(d => d.specialization === activeSpec);
    if (search.trim()) result = result.filter(d =>
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, activeSpec, doctors]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .search-input { width: 100%; padding: 12px 16px 12px 44px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .search-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .spec-btn { padding: 7px 16px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: Inter, sans-serif; }
        .spec-btn:hover { border-color: #0d9488; color: #0d9488; }
        .spec-btn.active { background: #0d9488; border-color: #0d9488; color: white; }
        .doctor-card { background: white; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; }
        .doctor-card:hover { border-color: #0d9488; box-shadow: 0 8px 24px rgba(13,148,136,0.1); transform: translateY(-2px); }
        .book-btn { width: 100%; padding: 10px; background: #0d9488; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: Inter, sans-serif; }
        .book-btn:hover { background: #0f766e; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />

        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Consultations</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 20, letterSpacing: '-0.02em' }}>Find a Doctor</h1>

            {/* Search bar */}
            <div style={{ position: 'relative', maxWidth: 520 }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input className="search-input" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Specialization filter */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {SPECIALIZATIONS.map(s => (
              <button key={s} className={`spec-btn ${activeSpec === s ? 'active' : ''}`} onClick={() => setActiveSpec(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

          {/* Count */}
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            {loading ? 'Loading doctors...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
          </p>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '60px', textAlign: 'center' }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No doctors found</p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Try a different name or specialization</p>
            </div>
          )}

          {/* Doctor cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((doc, i) => (
              <div key={doc.id} className="doctor-card fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>

                {/* Card header */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0d9488' }}>
                        {doc.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Dr. {doc.fullName}</p>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '3px 10px', borderRadius: 20, border: '1px solid #ccfbf1' }}>
                        {doc.specialization}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}/>
                      <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>Online</span>
                    </div>
                  </div>
                </div>

                {/* Card details */}
                <div style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', padding: '10px 6px', background: '#f9fafb', borderRadius: 7 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{doc.experience || '—'}</p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>Yrs Exp.</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px 6px', background: '#f9fafb', borderRadius: 7 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{doc.rating || '4.5'}</p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>Rating</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px 6px', background: '#f9fafb', borderRadius: 7 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0d9488', marginBottom: 2 }}>₹{doc.consultationFee || '—'}</p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>Fee</p>
                    </div>
                  </div>

                  {doc.bio && (
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {doc.bio}
                    </p>
                  )}

                  <button className="book-btn" onClick={() => navigate(`/book/${doc.id}`)}>
                    Book Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
