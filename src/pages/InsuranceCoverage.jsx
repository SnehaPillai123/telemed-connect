import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import NextStepBanner from "../components/NextStepBanner";
import toast from "react-hot-toast";

const INSURANCE_PROVIDERS = [
  "Star Health Insurance",
  "HDFC ERGO Health",
  "Niva Bupa (Max Bupa)",
  "Care Health Insurance",
  "Bajaj Allianz Health",
  "ICICI Lombard Health",
  "New India Assurance",
  "United India Insurance",
  "Oriental Insurance",
  "Aditya Birla Health",
  "ManipalCigna Health",
  "Tata AIG Health",
];

const HOSPITALS = [
  { name: "Apollo Hospitals", distance: "1.2 km", address: "Bannerghatta Road, Bangalore", phone: "1066", rating: 4.8, emergency: true, insurance: ["Star Health Insurance","HDFC ERGO Health","Niva Bupa (Max Bupa)","Care Health Insurance","ICICI Lombard Health","Aditya Birla Health","ManipalCigna Health","Tata AIG Health"] },
  { name: "Fortis Healthcare", distance: "2.4 km", address: "Cunningham Road, Bangalore", phone: "18001038989", rating: 4.7, emergency: true, insurance: ["Star Health Insurance","Bajaj Allianz Health","ICICI Lombard Health","New India Assurance","United India Insurance","HDFC ERGO Health","Care Health Insurance"] },
  { name: "Manipal Hospital", distance: "3.1 km", address: "Old Airport Road, Bangalore", phone: "08022224444", rating: 4.6, emergency: true, insurance: ["Niva Bupa (Max Bupa)","ManipalCigna Health","Star Health Insurance","Aditya Birla Health","Oriental Insurance","Tata AIG Health"] },
  { name: "Columbia Asia", distance: "4.8 km", address: "Hebbal, Bangalore", phone: "18002101111", rating: 4.5, emergency: false, insurance: ["HDFC ERGO Health","Star Health Insurance","Care Health Insurance","Bajaj Allianz Health"] },
  { name: "Narayana Health", distance: "5.2 km", address: "Hosur Road, Bangalore", phone: "18003010668", rating: 4.9, emergency: true, insurance: ["Star Health Insurance","HDFC ERGO Health","ICICI Lombard Health","Niva Bupa (Max Bupa)","Bajaj Allianz Health","New India Assurance","United India Insurance","Oriental Insurance","Aditya Birla Health","ManipalCigna Health","Tata AIG Health","Care Health Insurance"] },
  { name: "Sakra World Hospital", distance: "6.1 km", address: "Devarabeesanahalli, Bangalore", phone: "08049690000", rating: 4.7, emergency: true, insurance: ["ICICI Lombard Health","Aditya Birla Health","Star Health Insurance","HDFC ERGO Health","Tata AIG Health"] },
];

const PLAN_TYPES = ["Individual", "Family Floater", "Senior Citizen", "Group Insurance"];

export default function InsuranceCoverage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-insurance");
  const [insurance, setInsurance] = useState({
    provider: "",
    policyNumber: "",
    planType: "Individual",
    sumInsured: "",
    expiryDate: "",
    memberName: "",
    tpaName: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchInsurance = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "patients", user.uid));
        if (snap.exists() && snap.data().insurance) {
          setInsurance(prev => ({ ...prev, ...snap.data().insurance }));
          setSaved(true);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInsurance();
  }, [user]);

  const handleSave = async () => {
    if (!insurance.provider) return toast.error("Please select an insurance provider");
    setSaving(true);
    try {
      await updateDoc(doc(db, "patients", user.uid), {
        insurance,
        updatedAt: serverTimestamp(),
      });
      toast.success("Insurance details saved!");
      setSaved(true);
    } catch (err) { toast.error("Failed to save: " + err.message); }
    finally { setSaving(false); }
  };

  const coveredHospitals = insurance.provider
    ? HOSPITALS.filter(h => h.insurance.includes(insurance.provider))
    : [];

  const uncoveredHospitals = insurance.provider
    ? HOSPITALS.filter(h => !h.insurance.includes(insurance.provider))
    : [];

  return (
    <Layout title="Insurance Coverage" subtitle="Patient Portal">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }

        .ins-stat { background:white; border-radius:10px; border:1px solid #e5e7eb; padding:16px; text-align:center; }

        .form-input { width:100%; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:13px; color:#111827; background:white; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; }
        .form-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }

        .hosp-card { background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; transition:all 0.2s; }
        .hosp-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.07); }

        .covered-card { border-color:#bbf7d0; }
        .covered-card:hover { border-color:#16a34a; box-shadow:0 6px 20px rgba(22,163,74,0.1); }

        .call-btn { padding:7px 14px; background:#0d9488; color:white; border:none; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-family:Inter,sans-serif; transition:all 0.15s; }
        .call-btn:hover { background:#0f766e; }

        /* Stats grid */
        .ins-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }

        /* Hospital grid */
        .hosp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

        /* Tab bar */
        .tab-bar { display:flex; gap:8px; margin-bottom:20px; border-bottom:2px solid #f3f4f6; padding-bottom:0; overflow-x:auto; }
        .tab-btn { padding:10px 18px; border:none; background:none; font-size:13px; font-weight:500; color:#6b7280; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; white-space:nowrap; font-family:Inter,sans-serif; transition:all 0.15s; }
        .tab-btn.active { color:#0d9488; border-bottom-color:#0d9488; font-weight:700; }
        .tab-btn:hover { color:#0d9488; }

        /* Provider grid */
        .provider-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
        .provider-pill { padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:10px; background:white; font-size:12px; font-weight:500; color:#374151; cursor:pointer; transition:all 0.15s; text-align:center; font-family:Inter,sans-serif; }
        .provider-pill:hover { border-color:#0d9488; color:#0d9488; }
        .provider-pill.selected { background:#0d9488; border-color:#0d9488; color:white; font-weight:700; }

        @media screen and (max-width:599px) {
          .ins-stats-grid { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; }
          .hosp-grid { grid-template-columns:1fr !important; }
          .provider-grid { grid-template-columns:repeat(2,1fr) !important; }
          .ins-form-grid { grid-template-columns:1fr !important; }
        }
        @media screen and (min-width:600px) and (max-width:1024px) {
          .hosp-grid { grid-template-columns:repeat(2,1fr) !important; }
          .provider-grid { grid-template-columns:repeat(3,1fr) !important; }
        }
      `}</style>

      {/* Stats */}
      <div className="ins-stats-grid">
        {[
          { l: "Insurance Provider", v: insurance.provider ? insurance.provider.split(" ")[0] : "Not set", c: insurance.provider ? '#0d9488' : '#9ca3af', bg: insurance.provider ? '#f0fdfa' : '#f9fafb' },
          { l: "Covered Hospitals", v: coveredHospitals.length || "—", c: '#16a34a', bg: '#f0fdf4' },
          { l: "Plan Type", v: insurance.planType || "—", c: '#2563eb', bg: '#eff6ff' },
          { l: "Policy Status", v: insurance.expiryDate ? (new Date(insurance.expiryDate) > new Date() ? "Active ✓" : "Expired") : "—", c: insurance.expiryDate && new Date(insurance.expiryDate) > new Date() ? '#16a34a' : '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} className="ins-stat" style={{ background: s.bg }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: s.c, lineHeight: 1.2, marginBottom: 4 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: '#6b7280' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={"tab-btn " + (activeTab === "my-insurance" ? "active" : "")} onClick={() => setActiveTab("my-insurance")}>
          🛡️ My Insurance
        </button>
        <button className={"tab-btn " + (activeTab === "covered" ? "active" : "")} onClick={() => setActiveTab("covered")}>
          ✅ Covered Hospitals ({coveredHospitals.length})
        </button>
        <button className={"tab-btn " + (activeTab === "all" ? "active" : "")} onClick={() => setActiveTab("all")}>
          🏥 All Hospitals
        </button>
      </div>

      {/* MY INSURANCE TAB */}
      {activeTab === "my-insurance" && (
        <div className="fade-in">
          {/* Provider selector */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Select Your Insurance Provider</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>Choose your provider to see which nearby hospitals are covered.</p>
            <div className="provider-grid">
              {INSURANCE_PROVIDERS.map((p, i) => (
                <button key={i}
                  className={"provider-pill " + (insurance.provider === p ? "selected" : "")}
                  onClick={() => setInsurance(prev => ({ ...prev, provider: p }))}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Policy details form */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Policy Details</p>
            <div className="ins-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Policy Number</label>
                <input className="form-input" placeholder="e.g. SH-2024-123456" value={insurance.policyNumber}
                  onChange={e => setInsurance(p => ({ ...p, policyNumber: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Plan Type</label>
                <select className="form-input" value={insurance.planType}
                  onChange={e => setInsurance(p => ({ ...p, planType: e.target.value }))}>
                  {PLAN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Sum Insured (₹)</label>
                <input className="form-input" placeholder="e.g. 500000" type="number" value={insurance.sumInsured}
                  onChange={e => setInsurance(p => ({ ...p, sumInsured: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Policy Expiry Date</label>
                <input className="form-input" type="date" value={insurance.expiryDate}
                  onChange={e => setInsurance(p => ({ ...p, expiryDate: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Policy Holder Name</label>
                <input className="form-input" placeholder="Name on policy" value={insurance.memberName}
                  onChange={e => setInsurance(p => ({ ...p, memberName: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>TPA Name (if any)</label>
                <input className="form-input" placeholder="e.g. Medi Assist" value={insurance.tpaName}
                  onChange={e => setInsurance(p => ({ ...p, tpaName: e.target.value }))} />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '10px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "💾 Save Insurance Details"}
            </button>
          </div>

          {/* Preview covered hospitals if provider selected */}
          {insurance.provider && coveredHospitals.length > 0 && (
            <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '18px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                ✅ {coveredHospitals.length} hospitals near you accept {insurance.provider}
              </p>
              <p style={{ fontSize: 12, color: '#166534', marginBottom: 12 }}>During Emergency SOS, only these hospitals will be shown.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {coveredHospitals.map((h, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 500, color: '#15803d', background: 'white', padding: '5px 12px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                    🏥 {h.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COVERED HOSPITALS TAB */}
      {activeTab === "covered" && (
        <div className="fade-in">
          {!insurance.provider ? (
            <div style={{ background: 'white', borderRadius: 12, border: '2px dashed #e5e7eb', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No insurance provider selected</p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Go to "My Insurance" tab and select your provider to see covered hospitals.</p>
              <button onClick={() => setActiveTab("my-insurance")}
                style={{ padding: '10px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Set Up Insurance →
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Showing hospitals covered by {insurance.provider}</p>
                  <p style={{ fontSize: 12, color: '#166534' }}>These hospitals accept your insurance for cashless treatment</p>
                </div>
              </div>

              {coveredHospitals.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No covered hospitals found nearby</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>Try changing your insurance provider.</p>
                </div>
              ) : (
                <div className="hosp-grid">
                  {coveredHospitals.map((h, i) => (
                    <article key={i} className="hosp-card covered-card fade-in" style={{ animationDelay: i * 0.05 + "s", opacity: 0 }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #f0fdf4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>{h.name}</p>
                              <p style={{ fontSize: 11, color: '#6b7280' }}>{h.distance} away</p>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: 20, border: '1px solid #bbf7d0', flexShrink: 0 }}>Covered ✓</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{h.address}</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 11, color: '#374151' }}>⭐ {h.rating}</span>
                          {h.emergency && <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>24/7 Emergency</span>}
                        </div>
                      </div>
                      <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
                        <a href={"tel:" + h.phone} className="call-btn" style={{ flex: 1, justifyContent: 'center', background: '#16a34a' }}>
                          📞 Call
                        </a>
                        <a href={"https://www.google.com/maps/search/" + encodeURIComponent(h.name)} target="_blank" rel="noreferrer"
                          style={{ padding: '7px 12px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          📍 Map
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {uncoveredHospitals.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12 }}>
                    ⚠️ {uncoveredHospitals.length} hospitals NOT covered by your insurance
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {uncoveredHospitals.map((h, i) => (
                      <span key={i} style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', padding: '5px 12px', borderRadius: 20, border: '1px solid #e5e7eb' }}>
                        {h.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ALL HOSPITALS TAB */}
      {activeTab === "all" && (
        <div className="fade-in">
          <div style={{ background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#92400e' }}>
              💡 {insurance.provider ? "Green border = covered by " + insurance.provider : "Select your insurance provider to see which hospitals are covered."}
            </p>
          </div>
          <div className="hosp-grid">
            {HOSPITALS.map((h, i) => {
              const isCovered = insurance.provider && h.insurance.includes(insurance.provider);
              return (
                <article key={i} className={"hosp-card fade-in " + (isCovered ? "covered-card" : "")} style={{ animationDelay: i * 0.05 + "s", opacity: 0 }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: isCovered ? '#f0fdf4' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke={isCovered ? "#16a34a" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{h.name}</p>
                          <p style={{ fontSize: 11, color: '#6b7280' }}>{h.distance}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {isCovered && <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>Covered ✓</span>}
                        {h.emergency && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 20, border: '1px solid #fecaca' }}>24/7</span>}
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{h.address}</p>
                    <p style={{ fontSize: 11, color: '#374151' }}>⭐ {h.rating} · {h.insurance.length} insurers accepted</p>
                  </div>
                  <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
                    <a href={"tel:" + h.phone} className="call-btn" style={{ flex: 1, justifyContent: 'center', background: isCovered ? '#16a34a' : '#0d9488' }}>
                      📞 Call
                    </a>
                    <a href={"https://www.google.com/maps/search/" + encodeURIComponent(h.name)} target="_blank" rel="noreferrer"
                      style={{ padding: '7px 12px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      📍 Map
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <NextStepBanner
        icon="🚨"
        title="Set up Emergency SOS"
        desc="Your insurance info will be used during Emergency SOS to show only covered hospitals."
        btnLabel="Emergency SOS"
        btnPath="/emergency"
        btnSecondaryLabel="My Profile"
        btnSecondaryPath="/edit-profile"
        color="orange"
      />
    </Layout>
  );
}
