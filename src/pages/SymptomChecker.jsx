import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const MOCK_RESPONSES = {
  default: { possibleConditions: ["Viral infection", "Common cold", "Seasonal allergies"], recommendedSpecialist: "General Physician", urgency: "low", urgencyReason: "Symptoms appear mild and manageable", generalAdvice: "Rest well and stay hydrated. Monitor your symptoms over the next 48 hours. If symptoms worsen or new symptoms develop, consult a doctor promptly.", redFlags: ["High fever above 103°F", "Difficulty breathing", "Chest pain"] },
  chest: { possibleConditions: ["Angina", "Acid reflux", "Musculoskeletal strain", "Anxiety"], recommendedSpecialist: "Cardiologist", urgency: "high", urgencyReason: "Chest symptoms require prompt cardiac evaluation", generalAdvice: "Chest pain should always be evaluated by a medical professional. Avoid strenuous activity until assessed. Keep a record of when pain occurs.", redFlags: ["Pain radiating to arm or jaw", "Sweating with chest pain", "Shortness of breath", "Sudden severe pain"] },
  skin: { possibleConditions: ["Eczema", "Contact dermatitis", "Psoriasis", "Fungal infection"], recommendedSpecialist: "Dermatologist", urgency: "low", urgencyReason: "Skin conditions are generally non-urgent unless rapidly spreading", generalAdvice: "Avoid scratching the affected area. Keep skin moisturized and avoid known irritants. A dermatologist can provide accurate diagnosis and targeted treatment.", redFlags: ["Rapidly spreading rash", "Fever with skin changes", "Blistering", "Signs of infection"] },
  head: { possibleConditions: ["Tension headache", "Migraine", "Sinusitis", "Hypertension"], recommendedSpecialist: "Neurologist", urgency: "medium", urgencyReason: "Persistent headaches warrant professional evaluation", generalAdvice: "Rest in a quiet, dark room. Stay hydrated and avoid triggers like bright lights or loud sounds. Track frequency and severity of headaches.", redFlags: ["Sudden severe headache", "Headache with stiff neck", "Confusion or vision changes", "Headache after head injury"] },
  stomach: { possibleConditions: ["Gastritis", "Irritable bowel syndrome", "Food intolerance", "Peptic ulcer"], recommendedSpecialist: "General Physician", urgency: "low", urgencyReason: "Digestive symptoms are common and usually manageable", generalAdvice: "Eat small, frequent meals and avoid spicy or fatty foods. Stay hydrated. Keep a food diary to identify potential triggers.", redFlags: ["Blood in stool", "Severe abdominal pain", "Unexplained weight loss", "Persistent vomiting"] },
  breathing: { possibleConditions: ["Asthma", "Bronchitis", "Respiratory infection", "Allergic reaction"], recommendedSpecialist: "Pulmonologist", urgency: "high", urgencyReason: "Breathing difficulties require prompt medical attention", generalAdvice: "Avoid known respiratory irritants like smoke or dust. Rest and avoid exertion. If you have an inhaler, use it as prescribed.", redFlags: ["Severe shortness of breath", "Blue lips or fingertips", "Inability to speak in full sentences", "Rapid worsening"] },
  joint: { possibleConditions: ["Arthritis", "Tendinitis", "Ligament strain", "Gout"], recommendedSpecialist: "Orthopedic", urgency: "low", urgencyReason: "Joint pain is usually manageable with rest and medication", generalAdvice: "Rest the affected joint and apply ice to reduce swelling. Avoid activities that worsen the pain. Gentle stretching may help with stiffness.", redFlags: ["Severe swelling with fever", "Inability to bear weight", "Joint deformity", "Sudden severe pain after injury"] },
  mental: { possibleConditions: ["Anxiety disorder", "Depression", "Stress-related symptoms", "Sleep disorder"], recommendedSpecialist: "Psychiatrist", urgency: "medium", urgencyReason: "Mental health symptoms benefit from early professional support", generalAdvice: "Prioritize sleep and regular exercise. Practice relaxation techniques like deep breathing. Talking to a mental health professional can provide significant relief.", redFlags: ["Thoughts of self-harm", "Severe inability to function", "Complete social withdrawal", "Psychotic symptoms"] }
};

function getMockResult(symptoms) {
  const s = symptoms.toLowerCase();
  if (s.includes("chest") || s.includes("heart") || s.includes("cardiac")) return MOCK_RESPONSES.chest;
  if (s.includes("skin") || s.includes("rash") || s.includes("itch") || s.includes("acne")) return MOCK_RESPONSES.skin;
  if (s.includes("head") || s.includes("migraine") || s.includes("dizzy")) return MOCK_RESPONSES.head;
  if (s.includes("stomach") || s.includes("nausea") || s.includes("vomit") || s.includes("abdomen")) return MOCK_RESPONSES.stomach;
  if (s.includes("breath") || s.includes("lung") || s.includes("cough") || s.includes("asthma")) return MOCK_RESPONSES.breathing;
  if (s.includes("joint") || s.includes("knee") || s.includes("back") || s.includes("bone") || s.includes("muscle")) return MOCK_RESPONSES.joint;
  if (s.includes("anxiety") || s.includes("depress") || s.includes("mental") || s.includes("stress") || s.includes("sleep")) return MOCK_RESPONSES.mental;
  return MOCK_RESPONSES.default;
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1800));
    setResult(getMockResult(symptoms));
    setLoading(false);
  };

  const URGENCY_STYLE = {
    low:    { bg: '#f0fdfa', color: '#0d9488', border: '#ccfbf1', label: 'Low Urgency' },
    medium: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Medium Urgency' },
    high:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'High Urgency — Seek care soon' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; appearance: none; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .form-input::placeholder { color: #9ca3af; }
        .analyze-btn { width: 100%; padding: 12px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: Inter, sans-serif; }
        .analyze-btn:hover { background: #0f766e; }
        .analyze-btn:disabled { background: #5eead4; cursor: not-allowed; }
        label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />

        <main>
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 40px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>AI-Powered</p>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Symptom Checker</h1>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Describe your symptoms and our AI will suggest the right specialist for you.</p>
            </div>
          </header>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Input Form */}
              <section aria-label="Symptom input form">
                <div className="card" style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
                    Tell us about your symptoms
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label htmlFor="age">Age</label>
                        <input id="age" className="form-input" type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} min="1" max="120"/>
                      </div>
                      <div>
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" className="form-input" value={gender} onChange={e => setGender(e.target.value)}>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="symptoms">Describe your symptoms</label>
                      <textarea id="symptoms" className="form-input" value={symptoms} onChange={e => setSymptoms(e.target.value)}
                        placeholder="e.g. I have been experiencing chest pain for 2 days, shortness of breath when walking..."
                        rows={6} style={{ resize: 'vertical' }}
                        aria-required="true"/>
                    </div>
                    <button className="analyze-btn" onClick={analyze} disabled={loading || !symptoms.trim()} aria-busy={loading}>
                      {loading ? "Analyzing symptoms..." : "Analyze Symptoms"}
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: '#fffbeb', borderRadius: 10, padding: 16, border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Medical Disclaimer</p>
                  <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                    This tool is for informational purposes only and does not replace professional medical advice. Always consult a qualified doctor for diagnosis and treatment.
                  </p>
                </div>
              </section>

              {/* Results */}
              <section aria-label="Analysis results" aria-live="polite">
                {loading && (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} role="status" aria-label="Analyzing"/>
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Analyzing your symptoms...</p>
                  </div>
                )}

                {result && (
                  <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Urgency */}
                    {(() => {
                      const us = URGENCY_STYLE[result.urgency] || URGENCY_STYLE.low;
                      return (
                        <div style={{ background: us.bg, borderRadius: 10, padding: '14px 18px', border: `1px solid ${us.border}`, borderLeft: `4px solid ${us.color}` }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: us.color }}>{us.label}</p>
                          <p style={{ fontSize: 12, color: us.color, opacity: 0.85, marginTop: 3 }}>{result.urgencyReason}</p>
                        </div>
                      );
                    })()}

                    {/* Specialist */}
                    <div className="card" style={{ borderTop: '3px solid #0d9488' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recommended Specialist</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#0d9488', marginBottom: 14 }}>{result.recommendedSpecialist}</p>
                      <button onClick={() => navigate('/search-doctors')}
                        style={{ padding: '9px 18px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Find {result.recommendedSpecialist}
                      </button>
                    </div>

                    {/* Conditions */}
                    <div className="card">
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Possible Conditions</p>
                      {result.possibleConditions?.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < result.possibleConditions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }}/>
                          <p style={{ fontSize: 13, color: '#374151' }}>{c}</p>
                        </div>
                      ))}
                    </div>

                    {/* Advice */}
                    <div className="card" style={{ borderLeft: '4px solid #0d9488' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>General Advice</p>
                      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{result.generalAdvice}</p>
                    </div>

                    {/* Red flags */}
                    {result.redFlags?.length > 0 && (
                      <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 10 }}>Seek immediate care if you experience:</p>
                        {result.redFlags.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < result.redFlags.length - 1 ? '1px solid #fee2e2' : 'none' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}/>
                            <p style={{ fontSize: 12, color: '#991b1b' }}>{f}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!loading && !result && (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 14, textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" stroke="#0d9488" strokeWidth="1.5"/>
                        <path d="M12 8v4M12 16h.01" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Ready to analyze</p>
                      <p style={{ fontSize: 13, color: '#9ca3af' }}>Enter your symptoms on the left to get an AI-powered analysis</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}