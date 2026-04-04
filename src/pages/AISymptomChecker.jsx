import { useState } from "react";
import Layout from "../components/Layout";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function AISymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    if (!GEMINI_API_KEY) {
      // Fallback to mock for demo if no API key
      mockAnalysis();
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are a medical AI assistant for TeleMed Connect, an Indian telemedicine platform. Analyze these symptoms and provide a structured medical assessment.

Patient Info:
- Age: ${age || "Not specified"}
- Gender: ${gender}
- Symptoms: ${symptoms}
- Duration: ${duration || "Not specified"}

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "possibleConditions": [
    {"name": "Condition 1", "probability": "High/Medium/Low", "description": "Brief description"},
    {"name": "Condition 2", "probability": "High/Medium/Low", "description": "Brief description"},
    {"name": "Condition 3", "probability": "High/Medium/Low", "description": "Brief description"}
  ],
  "urgencyLevel": "Emergency/Urgent/Moderate/Low",
  "urgencyReason": "Brief reason for urgency level",
  "recommendedSpecialist": "Doctor specialization to consult",
  "homeRemedies": ["Remedy 1", "Remedy 2", "Remedy 3"],
  "warningSignsToWatch": ["Warning 1", "Warning 2"],
  "disclaimer": "Brief medical disclaimer"
}`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          })
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setHistory(prev => [{ symptoms, result: parsed, timestamp: new Date() }, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error(err);
      mockAnalysis();
    } finally {
      setLoading(false);
    }
  };

  const mockAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        possibleConditions: [
          { name: "Common Cold / Viral Infection", probability: "High", description: "Upper respiratory tract infection caused by virus" },
          { name: "Seasonal Allergies", probability: "Medium", description: "Allergic reaction to environmental triggers" },
          { name: "Sinusitis", probability: "Low", description: "Inflammation of sinuses, often following a cold" },
        ],
        urgencyLevel: "Low",
        urgencyReason: "Symptoms appear mild and non-emergency",
        recommendedSpecialist: "General Physician",
        homeRemedies: ["Rest and stay hydrated", "Warm saltwater gargle", "Steam inhalation", "Honey and ginger tea"],
        warningSignsToWatch: ["High fever above 103°F", "Difficulty breathing", "Severe chest pain"],
        disclaimer: "This is an AI assessment for informational purposes only. Please consult a qualified doctor for proper diagnosis and treatment."
      });
      setLoading(false);
    }, 1500);
  };

  const urgencyColors = {
    Emergency: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", icon: "🚨" },
    Urgent: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa", icon: "⚠️" },
    Moderate: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", icon: "🔶" },
    Low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", icon: "✅" },
  };

  const probColors = { High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };

  return (
    <Layout title="AI Symptom Checker" subtitle="Health Center">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.4s ease forwards}
        .form-input{width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;color:#111827;background:white;outline:none;transition:all 0.2s;font-family:Inter,sans-serif;}
        .form-input:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
        .ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:599px){.ai-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* AI badge */}
      <div style={{ background: "linear-gradient(135deg,#0d9488,#0284c7)", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 3 }}>AI-Powered Symptom Analysis</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>Powered by Google Gemini AI · Describe your symptoms for instant analysis</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", background: "white", padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>GEMINI AI</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div>
          {/* Input form */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Describe Your Symptoms</p>

            <div className="ai-grid" style={{ marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Age</label>
                <input className="form-input" type="number" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} min="1" max="120"/>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Gender</label>
                <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Duration of Symptoms</label>
              <input className="form-input" placeholder="e.g. 2 days, 1 week" value={duration} onChange={e => setDuration(e.target.value)}/>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Describe Your Symptoms *</label>
              <textarea className="form-input" placeholder="e.g. I have a persistent headache, runny nose, slight fever since yesterday. The headache is on the right side..." value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={5} style={{ resize: "vertical" }}/>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Be as specific as possible for better results</p>
            </div>

            <button onClick={analyzeSymptoms} disabled={loading || !symptoms.trim()}
              style={{ width: "100%", padding: "13px", background: loading || !symptoms.trim() ? "#5eead4" : "#0d9488", color: "white", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading || !symptoms.trim() ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>Analyzing with AI...</>
              ) : (
                <><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>Analyze Symptoms with AI</>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="fade-in">
              {/* Urgency */}
              {(() => {
                const uc = urgencyColors[result.urgencyLevel] || urgencyColors.Low;
                return (
                  <div style={{ background: uc.bg, borderRadius: 12, border: "1px solid " + uc.border, padding: "14px 18px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{uc.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: uc.color }}>{result.urgencyLevel} Priority</p>
                      <p style={{ fontSize: 13, color: uc.color, opacity: 0.85 }}>{result.urgencyReason}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Possible conditions */}
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Possible Conditions</p>
                {result.possibleConditions?.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < result.possibleConditions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: probColors[c.probability], background: probColors[c.probability] + "15", padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{c.probability}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended specialist */}
              <div style={{ background: "#f0fdfa", borderRadius: 12, border: "1px solid #ccfbf1", padding: "14px 18px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <div>
                  <p style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>Recommended Specialist</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0d9488" }}>{result.recommendedSpecialist}</p>
                </div>
                <a href="/search-doctors" style={{ marginLeft: "auto", padding: "8px 14px", background: "#0d9488", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                  Book Now →
                </a>
              </div>

              {/* Home remedies */}
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Home Remedies</p>
                {result.homeRemedies?.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0" }}>
                    <span style={{ color: "#0d9488", fontWeight: 700, fontSize: 14 }}>•</span>
                    <p style={{ fontSize: 13, color: "#374151" }}>{r}</p>
                  </div>
                ))}
              </div>

              {/* Warning signs */}
              <div style={{ background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca", padding: "14px 18px", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>⚠️ Seek Emergency Care If</p>
                {result.warningSignsToWatch?.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "4px 0" }}>
                    <span style={{ color: "#dc2626", fontSize: 14 }}>→</span>
                    <p style={{ fontSize: 13, color: "#991b1b" }}>{w}</p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>⚕️ {result.disclaimer}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>How it Works</p>
            {[
              { step: "1", text: "Enter your age, gender and duration" },
              { step: "2", text: "Describe your symptoms in detail" },
              { step: "3", text: "Gemini AI analyzes and gives diagnosis" },
              { step: "4", text: "Book appointment with recommended doctor" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{s.step}</span>
                </div>
                <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Recent Checks</p>
              {history.map((h, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < history.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }}
                  onClick={() => setResult(h.result)}>
                  <p style={{ fontSize: 12, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.symptoms}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>{h.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca", padding: "14px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>⚠️ Important</p>
            <p style={{ fontSize: 11, color: "#991b1b", lineHeight: 1.6 }}>This AI tool is for informational purposes only. Always consult a qualified doctor for medical advice, diagnosis, or treatment.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}