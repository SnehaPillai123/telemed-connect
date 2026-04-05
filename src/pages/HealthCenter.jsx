import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OPENROUTER_KEY = "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";

// Only used if OpenRouter completely fails (network down etc.)
const EMERGENCY_FALLBACK = {
  possibleConditions: ["Unable to analyze — please try again"],
  recommendedSpecialist: "General Physician",
  urgency: "low",
  urgencyReason: "Could not connect to AI service",
  generalAdvice: "We could not reach the AI service right now. Please try again in a moment or consult a doctor directly.",
  homeRemedies: [],
  dietTips: [],
  restAdvice: "",
  medications: [],
  redFlags: ["If symptoms are severe, please see a doctor immediately"]
};

export default function HealthCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Symptom Checker state
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [scLoading, setScLoading] = useState(false);
  const [scResult, setScResult] = useState(null);
  const [scError, setScError] = useState("");
  const [activeTab, setActiveTab] = useState("symptom");

  // Ask Before You Book state
  const [abbQuestion, setAbbQuestion] = useState(0);
  const [abbAnswers, setAbbAnswers] = useState({});
  const [abbResult, setAbbResult] = useState(null);

  const handleABBAnswer = (qId, answer) => {
    const updated = { ...abbAnswers, [qId]: answer };
    setAbbAnswers(updated);
    if (qId < abbQuestions.length - 1) {
      setAbbQuestion(qId + 1);
    } else {
      generateABBResult(updated);
    }
  };

  const abbQuestions = [
    { id: 0, text: "How long have you had these symptoms?", options: ["Less than 24 hours", "1-3 days", "More than 3 days", "More than a week"] },
    { id: 1, text: "How would you rate your pain/discomfort?", options: ["Mild (can continue daily activities)", "Moderate (affecting daily activities)", "Severe (cannot do daily activities)", "No pain, just other symptoms"] },
    { id: 2, text: "Do you have a fever?", options: ["No fever", "Low grade (37.5-38°C)", "High fever (above 38°C)", "Not sure"] },
    { id: 3, text: "Have you had similar symptoms before?", options: ["Yes, regularly", "Yes, occasionally", "No, first time", "Not sure"] },
    { id: 4, text: "Do you have any chronic conditions?", options: ["Diabetes", "Hypertension", "Heart disease", "None"] }
  ];

  const generateABBResult = (answers) => {
    let urgent = 0;
    if (answers[1] === "Severe (cannot do daily activities)") urgent += 2;
    if (answers[2] === "High fever (above 38°C)") urgent += 2;
    if (answers[0] === "More than a week") urgent += 1;
    if (answers[3] === "No, first time") urgent += 1;
    if (answers[4] !== "None") urgent += 1;

    if (urgent >= 4) setAbbResult({ type: "urgent", title: "See a Doctor Today", message: "Your symptoms suggest you need prompt medical attention. Please book a consultation today.", action: "Book Consultation Now", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" });
    else if (urgent >= 2) setAbbResult({ type: "monitor", title: "Book a Consultation Soon", message: "Your symptoms are moderate. It's advisable to consult a doctor within the next 1-2 days.", action: "Book Consultation", color: "#d97706", bg: "#fffbeb", border: "#fde68a" });
    else setAbbResult({ type: "mild", title: "Monitor Your Symptoms", message: "Your symptoms appear mild. You can monitor them for now, but book a consultation if they worsen.", action: "Browse Doctors", color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" });
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setScLoading(true);
    setScResult(null);
    setScError("");

    const prompt = `You are an expert medical AI assistant helping patients in India. A patient has described their symptoms. Provide a thorough, accurate, and helpful medical analysis.

Patient Details:
- Age: ${age || "not specified"}
- Gender: ${gender}
- Symptoms: ${symptoms}

You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no code blocks. Just raw JSON.

The JSON must have exactly these fields:
{
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendedSpecialist": "specific doctor type",
  "urgency": "low" or "medium" or "high",
  "urgencyReason": "one clear sentence explaining urgency level",
  "generalAdvice": "3-4 detailed sentences of practical advice for right now",
  "homeRemedies": ["specific remedy 1 with how to use it", "specific remedy 2 with details", "specific remedy 3 with details"],
  "dietTips": ["specific food to eat and why", "specific food to avoid and why", "hydration advice"],
  "restAdvice": "2-3 sentences about rest, sleep, and activity level",
  "medications": ["specific OTC medicine available in India with dosage guidance"],
  "redFlags": ["warning sign that needs emergency care 1", "warning sign 2", "warning sign 3"]
}

Base your analysis on the actual symptoms given. If the input is not medical symptoms (e.g. random text), set urgency to "low" and generalAdvice to "Please describe actual symptoms for a proper medical analysis."`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://telemed-connect-6e817.web.app",
          "X-Title": "TeleMed Connect"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "";

      console.log("OpenRouter raw response:", rawText);

      // Extract JSON from response
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      // Validate it has expected fields
      if (!parsed.possibleConditions || !parsed.generalAdvice) {
        throw new Error("Invalid response structure");
      }

      setScResult(parsed);
    } catch (err) {
      console.error("AI error:", err);
      setScError(`AI service error: ${err.message}. Please try again.`);
      setScResult(EMERGENCY_FALLBACK);
    }

    setScLoading(false);
  };

  const urgencyColor = {
    low: { bg: "#f0fdf4", border: "#a7f3d0", text: "#059669", label: "Low Urgency" },
    medium: { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "Medium Urgency" },
    high: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "High Urgency" }
  };

  const uc = scResult ? (urgencyColor[scResult.urgency] || urgencyColor.low) : null;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Health Tools</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Health Center</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#10b981" }}>● Online</span>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0d9488", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {currentUser?.email?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", display: "flex" }}>
        <button
          onClick={() => setActiveTab("symptom")}
          style={{ flex: 1, padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontWeight: activeTab === "symptom" ? 600 : 400, color: activeTab === "symptom" ? "#0d9488" : "#64748b", borderBottom: activeTab === "symptom" ? "2px solid #0d9488" : "2px solid transparent", fontSize: 14 }}
        >
          🩺 Symptom Checker (AI)
        </button>
        <button
          onClick={() => setActiveTab("abb")}
          style={{ flex: 1, padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontWeight: activeTab === "abb" ? 600 : 400, color: activeTab === "abb" ? "#0d9488" : "#64748b", borderBottom: activeTab === "abb" ? "2px solid #0d9488" : "2px solid transparent", fontSize: 14 }}
        >
          ❓ Ask Before You Book
        </button>
      </div>

      {/* Symptom Checker Tab */}
      {activeTab === "symptom" && (
        <div style={{ display: "flex", gap: 20, padding: 24, maxWidth: 1200, margin: "0 auto" }}>
          {/* Left - Input */}
          <div style={{ flex: 1 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Describe Your Symptoms</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Your symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail. e.g. 'I have had a fever of 38.5°C for 2 days, along with severe headache, body pain and sore throat...'"
                  rows={5}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={analyzeSymptoms}
                disabled={scLoading || !symptoms.trim()}
                style={{ width: "100%", padding: "14px", background: scLoading ? "#99d6cf" : "#0d9488", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: scLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {scLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Analyzing with AI...
                  </>
                ) : "✨ Analyze Symptoms"}
              </button>

              {scError && (
                <div style={{ marginTop: 12, padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
                  {scError}
                </div>
              )}

              <div style={{ marginTop: 16, padding: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#92400e", marginBottom: 4 }}>⚠️ Medical Disclaimer</div>
                <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>This tool uses real AI analysis for informational purposes only and does not replace professional medical advice. Always consult a qualified doctor.</div>
              </div>
            </div>
          </div>

          {/* Right - Results */}
          <div style={{ width: 360 }}>
            {!scResult && !scLoading && (
              <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>AI-Powered Analysis</div>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>Powered by Llama 3.2 via OpenRouter. Enter your symptoms on the left to get real AI-powered medical analysis.</p>
              </div>
            )}

            {scLoading && (
              <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Analyzing your symptoms...</div>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Llama 3.2 AI is processing your symptoms</p>
              </div>
            )}

            {scResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Urgency */}
                <div style={{ background: uc.bg, border: `1px solid ${uc.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: uc.text, fontSize: 16 }}>{uc.label}</div>
                  <div style={{ fontSize: 13, color: uc.text, marginTop: 4 }}>{scResult.urgencyReason}</div>
                </div>

                {/* Specialist */}
                <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 1, marginBottom: 8 }}>RECOMMENDED SPECIALIST</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#0d9488", marginBottom: 12 }}>{scResult.recommendedSpecialist}</div>
                  <button onClick={() => navigate("/find-doctors")} style={{ width: "100%", padding: "10px", background: "#0d9488", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Find {scResult.recommendedSpecialist}
                  </button>
                </div>

                {/* Possible Conditions */}
                <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 12 }}>Possible Conditions</div>
                  {scResult.possibleConditions?.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 14 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d9488", flexShrink: 0 }} />
                      {c}
                    </div>
                  ))}
                </div>

                {/* General Advice */}
                <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>💊 General Advice</div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{scResult.generalAdvice}</p>
                </div>

                {/* Home Remedies */}
                {scResult.homeRemedies?.length > 0 && (
                  <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>🌿 Home Remedies</div>
                    {scResult.homeRemedies.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 13 }}>
                        <span style={{ color: "#0d9488", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ color: "#374151", lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Diet Tips */}
                {scResult.dietTips?.length > 0 && (
                  <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>🥗 Diet & Nutrition</div>
                    {scResult.dietTips.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0 }}>•</span>
                        <span style={{ color: "#374151", lineHeight: 1.6 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rest Advice */}
                {scResult.restAdvice && (
                  <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>😴 Rest & Activity</div>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{scResult.restAdvice}</p>
                  </div>
                )}

                {/* Medications */}
                {scResult.medications?.length > 0 && (
                  <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>💊 OTC Medicines (India)</div>
                    {scResult.medications.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: "#7c3aed", flexShrink: 0 }}>💊</span>
                        <span style={{ color: "#374151", lineHeight: 1.6 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Red Flags */}
                {scResult.redFlags?.length > 0 && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: 12 }}>🚨 Seek Immediate Care If:</div>
                    {scResult.redFlags.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: "#dc2626", flexShrink: 0 }}>⚠</span>
                        <span style={{ color: "#7f1d1d", lineHeight: 1.6 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ask Before You Book Tab */}
      {activeTab === "abb" && (
        <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
          {!abbResult ? (
            <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {abbQuestions.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= abbQuestion ? "#0d9488" : "#e2e8f0" }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Question {abbQuestion + 1} of {abbQuestions.length}</div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{abbQuestions[abbQuestion].text}</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {abbQuestions[abbQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleABBAnswer(abbQuestion, opt)}
                    style={{ padding: "14px 18px", background: "white", border: "2px solid #e2e8f0", borderRadius: 10, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.borderColor = "#0d9488"; e.target.style.background = "#f0fdfa"; }}
                    onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "white"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: abbResult.bg, border: `2px solid ${abbResult.border}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {abbResult.type === "urgent" ? "🚨" : abbResult.type === "monitor" ? "⚠️" : "✅"}
              </div>
              <h2 style={{ color: abbResult.color, marginBottom: 12 }}>{abbResult.title}</h2>
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginBottom: 24 }}>{abbResult.message}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => navigate("/find-doctors")} style={{ padding: "12px 24px", background: abbResult.color, color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                  {abbResult.action}
                </button>
                <button onClick={() => { setAbbQuestion(0); setAbbAnswers({}); setAbbResult(null); }} style={{ padding: "12px 24px", background: "white", color: abbResult.color, border: `2px solid ${abbResult.color}`, borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}