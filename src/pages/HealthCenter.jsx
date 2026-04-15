import { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const SMART_DB = {
  chest:{ conditions:[{name:"Angina / Coronary Artery Disease",prob:"High"},{name:"Costochondritis",prob:"Medium"},{name:"GERD / Acid Reflux",prob:"Medium"}], specialist:"Cardiologist", urgency:"urgent", homeRemedies:["Sit upright and rest immediately","Loosen tight clothing around chest","Take deep slow breaths to calm the nervous system"], dietTips:["Avoid caffeine, spicy food, and alcohol","Eat small light meals — don't overeat","Stay well hydrated with warm water"], restAdvice:"Rest completely in a semi-upright position. Avoid any physical exertion. If pain radiates to arm or jaw, call 112 immediately.", redFlags:["Chest pain radiating to left arm or jaw","Sweating with chest tightness","Shortness of breath with chest pain"] },
  head:{ conditions:[{name:"Migraine",prob:"High"},{name:"Tension Headache",prob:"High"},{name:"Sinusitis",prob:"Medium"}], specialist:"Neurologist", urgency:"moderate", homeRemedies:["Cold or warm compress on forehead for 15 minutes","Peppermint oil diluted on temples — gentle circular massage","Ginger tea: boil fresh ginger 10 minutes, add honey, drink twice daily"], dietTips:["Drink 8-10 glasses of water — dehydration worsens headaches","Avoid caffeine and alcohol","Eat bananas or nuts for magnesium which reduces migraine"], restAdvice:"Rest in a dark, quiet room with head slightly elevated. Avoid screens and bright light. Sleep for at least 8 hours without interruption.", redFlags:["Sudden severe thunderclap headache","Headache with stiff neck and fever","Headache with confusion or vision changes"] },
  fever:{ conditions:[{name:"Viral Fever / Flu",prob:"High"},{name:"Dengue Fever",prob:"Medium"},{name:"Typhoid",prob:"Low"}], specialist:"General Physician", urgency:"moderate", homeRemedies:["Wet cloth on forehead changed every 15 minutes","Tulsi and ginger kadha: boil together with honey","Lukewarm water sponge bath to bring temperature down"], dietTips:["Drink ORS solution or coconut water every hour","Eat khichdi, dal rice, and light soups","Avoid fried, spicy food completely until fever breaks"], restAdvice:"Complete bed rest is mandatory. Do not go to work or school. Change clothes if sweating heavily. Monitor temperature every 4 hours.", redFlags:["Fever above 103°F (39.4°C) for more than 3 days","Fever with rash or bleeding","Fever with severe body pain and eye pain (Dengue sign)"] },
  stomach:{ conditions:[{name:"Gastroenteritis",prob:"High"},{name:"Food Poisoning",prob:"High"},{name:"Irritable Bowel Syndrome",prob:"Medium"}], specialist:"Gastroenterologist", urgency:"moderate", homeRemedies:["ORS: mix 1 liter water, 6 teaspoons sugar, half teaspoon salt","Banana and yogurt: easy to digest and restore good bacteria","Ginger and jeera water: boil 5 minutes, drink warm"], dietTips:["Follow BRAT diet: Bananas, Rice, Applesauce, Toast","Avoid dairy, fried food, and raw vegetables","Small frequent meals every 2 hours instead of large meals"], restAdvice:"Rest and avoid physical activity. Do not fast — eat small amounts regularly. If vomiting, wait 30 minutes after vomiting before eating again.", redFlags:["Blood in stool or vomit","Severe abdominal pain that doesn't ease","No urination for 8+ hours (severe dehydration)"] },
  breathing:{ conditions:[{name:"Asthma",prob:"High"},{name:"Bronchitis",prob:"Medium"},{name:"Anxiety / Panic Attack",prob:"Medium"}], specialist:"Pulmonologist", urgency:"urgent", homeRemedies:["Steam inhalation with eucalyptus oil for 10 minutes","Sit upright and breathe slowly through pursed lips","Honey and warm water with a pinch of turmeric"], dietTips:["Avoid cold foods and cold drinks completely","Eat anti-inflammatory foods: turmeric, ginger, garlic","Avoid dairy if it triggers mucus production"], restAdvice:"Sit upright — never lie flat when having breathing difficulty. Keep windows open for fresh air. Avoid exertion completely until breathing normalizes.", redFlags:["Blue or gray lips or fingernails","Cannot complete a full sentence due to breathlessness","Breathing rate above 30 per minute"] },
  skin:{ conditions:[{name:"Allergic Reaction / Urticaria",prob:"High"},{name:"Eczema",prob:"Medium"},{name:"Fungal Infection",prob:"Medium"}], specialist:"Dermatologist", urgency:"low", homeRemedies:["Cold compress: ice wrapped in cloth, apply 10 minutes on affected area","Aloe vera gel directly from leaf — apply 3 times daily","Neem paste: grind neem leaves with water, apply for 20 minutes"], dietTips:["Avoid known allergens: shellfish, nuts, dairy if allergic","Increase Vitamin C intake: amla, citrus fruits, capsicum","Drink plenty of water to flush toxins"], restAdvice:"Avoid scratching — it worsens the condition and causes infection. Wear loose cotton clothes. Keep the affected area clean and dry.", redFlags:["Rash spreading rapidly over the whole body","Skin rash with fever and difficulty breathing","Swelling of lips, tongue, or throat with rash"] },
  joint:{ conditions:[{name:"Arthritis",prob:"High"},{name:"Muscle Strain",prob:"High"},{name:"Gout",prob:"Medium"}], specialist:"Orthopedic", urgency:"low", homeRemedies:["Hot water bag on affected joint for 20 minutes","Turmeric milk: one teaspoon turmeric in warm milk before bed","Epsom salt warm water soak for 15 minutes"], dietTips:["Eat anti-inflammatory foods: walnuts, flaxseeds, olive oil","Avoid uric acid triggers: red meat, alcohol, processed food","Maintain healthy weight — every extra kg adds 4x pressure on knee"], restAdvice:"Rest the affected joint. Elevate if swollen. Avoid activities that cause pain. Gentle range-of-motion exercises are okay but stop if pain increases.", redFlags:["Joint is red, hot, and severely swollen","Fever with joint pain (possible infection)","Cannot bear weight on the joint at all"] },
  mental:{ conditions:[{name:"Anxiety Disorder",prob:"High"},{name:"Depression",prob:"Medium"},{name:"Stress-related symptoms",prob:"High"}], specialist:"Psychiatrist", urgency:"low", homeRemedies:["4-7-8 breathing: inhale 4 sec, hold 7, exhale 8","10-minute morning walk in sunlight — increases serotonin","Write 3 things you are grateful for before sleeping"], dietTips:["Eat magnesium-rich foods: dark chocolate, spinach, almonds","Avoid excess caffeine and sugar which worsen anxiety","Omega-3 sources: walnuts, flaxseeds help brain health"], restAdvice:"Maintain regular 8-hour sleep schedule. Avoid social media before bed. Connect with family and friends. Journaling and meditation are proven to help.", redFlags:["Thoughts of self-harm or harming others","Unable to perform basic daily activities","Severe panic attacks more than once per day"] },
};

const ABB_QUESTIONS = [
  { id:1, text:"How long have your symptoms lasted?", options:["Less than 24 hours","1–3 days","More than 3 days","Over a week"] },
  { id:2, text:"How severe is your discomfort on a scale?", options:["Mild — barely noticeable","Moderate — manageable","Severe — hard to ignore","Unbearable — can't function"] },
  { id:3, text:"Have you tried any home remedies?", options:["Yes, and they helped","Yes, but no improvement","No, I just started symptoms","I don't know what to try"] },
  { id:4, text:"Do you have a fever or temperature?", options:["No fever","Mild fever under 38°C","High fever above 38°C","I haven't checked"] },
  { id:5, text:"Have you had these symptoms before?", options:["First time ever","Occasionally in the past","Frequently recurring","Ongoing chronic issue"] },
];

export default function HealthCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("symptom");

  // Symptom Checker
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Female");
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ABB
  const [abbStep, setAbbStep] = useState(0);
  const [abbAnswers, setAbbAnswers] = useState([]);
  const [abbResult, setAbbResult] = useState(null);

  const analyze = async () => {
    if (!symptoms.trim()) return;
    setAnalyzing(true);
    setResult(null);

    const kw = symptoms.toLowerCase();
    let match = null;
    if (kw.match(/chest|heart|cardiac|palpitat/)) match = SMART_DB.chest;
    else if (kw.match(/head|migraine|dizz|vertigo/)) match = SMART_DB.head;
    else if (kw.match(/fever|temperature|chills|sweat/)) match = SMART_DB.fever;
    else if (kw.match(/stomach|nausea|vomit|diarr|abdomen|digest/)) match = SMART_DB.stomach;
    else if (kw.match(/breath|cough|asthma|lung|wheez/)) match = SMART_DB.breathing;
    else if (kw.match(/skin|rash|itch|allerg|hive/)) match = SMART_DB.skin;
    else if (kw.match(/joint|knee|back|muscle|pain|ache/)) match = SMART_DB.joint;
    else if (kw.match(/anxiety|stress|depress|mental|panic|mood/)) match = SMART_DB.mental;
    else match = SMART_DB.fever; // default

    // Try Gemini
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (GEMINI_KEY) {
      try {
        const prompt = `You are a medical AI for India. Analyze: Age:${age||"?"}, Gender:${gender}, Symptoms:${symptoms}, Duration:${duration||"?"}\nRespond ONLY with JSON: {"conditions":[{"name":"","prob":"High/Medium/Low"}],"specialist":"","urgency":"low/moderate/urgent","homeRemedies":[""],"dietTips":[""],"restAdvice":"","redFlags":[""]}`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.3,maxOutputTokens:800} })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text||"";
        const s = text.indexOf("{"); const e = text.lastIndexOf("}");
        if (s>-1&&e>-1) {
          const parsed = JSON.parse(text.slice(s,e+1));
          if (parsed.conditions) {
            setResult({ conditions: parsed.conditions, specialist: parsed.specialist||match.specialist, urgency: parsed.urgency||match.urgency, homeRemedies: parsed.homeRemedies||match.homeRemedies, dietTips: parsed.dietTips||match.dietTips, restAdvice: parsed.restAdvice||match.restAdvice, redFlags: parsed.redFlags||match.redFlags });
            setAnalyzing(false); return;
          }
        }
      } catch(e) { /* fallback */ }
    }

    // Fallback to SMART_DB
    setTimeout(() => {
      setResult({ conditions: match.conditions, specialist: match.specialist, urgency: match.urgency, homeRemedies: match.homeRemedies, dietTips: match.dietTips, restAdvice: match.restAdvice, redFlags: match.redFlags });
      setAnalyzing(false);
    }, 800);
  };

  const abbAnswer = (answer) => {
    const newAnswers = [...abbAnswers, answer];
    setAbbAnswers(newAnswers);
    if (abbStep < ABB_QUESTIONS.length - 1) {
      setTimeout(() => setAbbStep(abbStep + 1), 250);
    } else {
      const urgent = newAnswers.filter((a,i) => {
        if (i===0) return a.includes("More than") || a.includes("Over a week");
        if (i===1) return a.includes("Severe") || a.includes("Unbearable");
        if (i===2) return a.includes("no improvement");
        if (i===3) return a.includes("High fever");
        if (i===4) return a.includes("Frequently") || a.includes("Ongoing");
        return false;
      }).length;
      let rec;
      if (urgent >= 3) rec = { type:"urgent", title:"Seek Medical Care Today", msg:"Your symptoms suggest you need prompt medical attention. Please book a consultation now.", color:"#dc2626", bg:"#fef2f2", icon:"🚨" };
      else if (urgent >= 2) rec = { type:"consult", title:"Book a Consultation", msg:"Your symptoms would benefit from professional evaluation. A doctor can help confirm the cause and provide proper treatment.", color:"#d97706", bg:"#fffbeb", icon:"📋" };
      else rec = { type:"selfcare", title:"Self-Care at Home", msg:"Your symptoms appear mild. Rest, hydrate, and monitor. If symptoms worsen or persist beyond 3 days, please consult a doctor.", color:"#16a34a", bg:"#f0fdf4", icon:"🏠" };
      setAbbResult(rec);
    }
  };

  const urgencyStyle = { urgent:{bg:"#fef2f2",color:"#dc2626",border:"#fecaca",icon:"🚨"}, moderate:{bg:"#fffbeb",color:"#d97706",border:"#fde68a",icon:"⚠️"}, low:{bg:"#f0fdf4",color:"#16a34a",border:"#bbf7d0",icon:"✅"} };

  return (
    <Layout title="Health Center" subtitle="AI Tools">
      <style>{`
        .form-input{width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;color:#111827;background:white;outline:none;transition:all 0.2s;font-family:Inter,sans-serif;box-sizing:border-box;}
        .form-input:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.4s ease forwards}
        @keyframes spin{to{transform:rotate(360deg)}}
        .abb-option{padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;font-family:Inter,sans-serif;background:white;cursor:pointer;text-align:left;transition:all 0.15s;color:#374151;width:100%;}
        .abb-option:hover{border-color:#0d9488;background:#f0fdfa;color:#0d9488;}
        @media(max-width:599px){.hc-top-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={"tab-btn "+(activeTab==="symptom"?"active":"")} onClick={()=>setActiveTab("symptom")}>🤖 AI Symptom Checker</button>
        <button className={"tab-btn "+(activeTab==="abb"?"active":"")} onClick={()=>{setActiveTab("abb");setAbbStep(0);setAbbAnswers([]);setAbbResult(null);}}>🤔 Ask Before You Book</button>
      </div>

      {/* ── SYMPTOM CHECKER ── */}
      {activeTab === "symptom" && (
        <div>
          <div style={{ background:"linear-gradient(135deg,#0d9488,#0284c7)", borderRadius:14, padding:"18px 22px", marginBottom:20, display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:16, fontWeight:800, color:"white", marginBottom:2 }}>AI-Powered Symptom Analysis</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>Describe your symptoms for instant AI analysis with home remedies and specialist recommendation</p>
            </div>
          </div>

          {/* Input form - full width */}
          <div style={{ background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:"20px", marginBottom:16 }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:14 }}>Tell us about your symptoms</p>

            {/* Top fields horizontal */}
            <div className="hc-top-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Age</label>
                <input className="form-input" type="number" placeholder="e.g. 28" value={age} onChange={e=>setAge(e.target.value)} min="1" max="120"/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Gender</label>
                <select className="form-input" value={gender} onChange={e=>setGender(e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Duration</label>
                <input className="form-input" placeholder="e.g. 2 days" value={duration} onChange={e=>setDuration(e.target.value)}/>
              </div>
            </div>

            {/* Symptoms textarea - full width */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Describe Your Symptoms *</label>
              <textarea className="form-input" placeholder="e.g. I have a persistent headache, runny nose, slight fever since yesterday. The headache is on the right side and worsens in bright light..." value={symptoms} onChange={e=>setSymptoms(e.target.value)} rows={4} style={{ resize:"vertical" }}/>
              <p style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>Be as specific as possible for better results</p>
            </div>

            {/* Analyze button - full width, below textarea */}
            <button onClick={analyze} disabled={analyzing||!symptoms.trim()}
              style={{ width:"100%", padding:"13px", background:analyzing||!symptoms.trim()?"#5eead4":"#0d9488", color:"white", border:"none", borderRadius:9, fontSize:15, fontWeight:700, cursor:analyzing||!symptoms.trim()?"not-allowed":"pointer", fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              {analyzing ? (
                <><div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>Analyzing your symptoms...</>
              ) : (
                <><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>Analyze Symptoms with AI</>
              )}
            </button>
          </div>

          {/* Results - below input, full width */}
          {result && (
            <div className="fade-in">
              {/* Urgency banner */}
              {(() => { const u = urgencyStyle[result.urgency]||urgencyStyle.low; return (
                <div style={{ background:u.bg, borderRadius:12, border:"1px solid "+u.border, padding:"14px 18px", marginBottom:14, display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:22 }}>{u.icon}</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:u.color, textTransform:"capitalize" }}>{result.urgency} Priority</p>
                    <p style={{ fontSize:13, color:u.color, opacity:0.85 }}>
                      {result.urgency==="urgent"?"Please consult a doctor today.":result.urgency==="moderate"?"Schedule an appointment within a few days.":"Monitor symptoms and use home care."}
                    </p>
                  </div>
                </div>
              )})()}

              {/* 2-col grid for results on desktop */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {/* Possible conditions */}
                <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"16px" }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:12 }}>Possible Conditions</p>
                  {(result.conditions||[]).map((c,i) => (
                    <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<(result.conditions?.length||0)-1?"1px solid #f3f4f6":"none", alignItems:"center" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:c.prob==="High"?"#dc2626":c.prob==="Medium"?"#d97706":"#16a34a", background:c.prob==="High"?"#fef2f2":c.prob==="Medium"?"#fffbeb":"#f0fdf4", padding:"2px 8px", borderRadius:20, flexShrink:0 }}>{c.prob}</span>
                      <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{c.name}</p>
                    </div>
                  ))}
                </div>

                {/* Specialist + Home remedies */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ background:"#f0fdfa", borderRadius:12, border:"1px solid #ccfbf1", padding:"14px", display:"flex", gap:12, alignItems:"center" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:11, color:"#0d9488", fontWeight:600 }}>Recommended Specialist</p>
                      <p style={{ fontSize:15, fontWeight:700, color:"#0d9488" }}>{result.specialist}</p>
                    </div>
                    <button onClick={()=>navigate("/search-doctors")} style={{ padding:"7px 12px", background:"#0d9488", color:"white", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif", flexShrink:0 }}>Book →</button>
                  </div>

                  <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px" }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:8 }}>Home Remedies</p>
                    {(result.homeRemedies||[]).map((r,i) => (
                      <div key={i} style={{ display:"flex", gap:8, padding:"4px 0" }}>
                        <span style={{ color:"#0d9488", fontWeight:700, fontSize:14, flexShrink:0 }}>•</span>
                        <p style={{ fontSize:12, color:"#374151", lineHeight:1.6 }}>{r}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet tips */}
                <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px" }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:8 }}>Diet & Nutrition Tips</p>
                  {(result.dietTips||[]).map((t,i) => (
                    <div key={i} style={{ display:"flex", gap:8, padding:"4px 0" }}>
                      <span style={{ color:"#2563eb", fontWeight:700, fontSize:14, flexShrink:0 }}>•</span>
                      <p style={{ fontSize:12, color:"#374151", lineHeight:1.6 }}>{t}</p>
                    </div>
                  ))}
                </div>

                {/* Rest advice */}
                <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px" }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:8 }}>Rest & Recovery</p>
                  <p style={{ fontSize:12, color:"#374151", lineHeight:1.7 }}>{result.restAdvice}</p>
                </div>
              </div>

              {/* Red flags - full width */}
              <div style={{ background:"#fef2f2", borderRadius:12, border:"1px solid #fecaca", padding:"14px 18px", marginTop:14 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#dc2626", marginBottom:8 }}>⚠️ Seek Emergency Care If</p>
                {(result.redFlags||[]).map((w,i) => (
                  <div key={i} style={{ display:"flex", gap:8, padding:"3px 0" }}>
                    <span style={{ color:"#dc2626", fontSize:13, flexShrink:0 }}>→</span>
                    <p style={{ fontSize:13, color:"#991b1b" }}>{w}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:"#f9fafb", borderRadius:10, border:"1px solid #e5e7eb", padding:"10px 14px", marginTop:12 }}>
                <p style={{ fontSize:11, color:"#9ca3af", lineHeight:1.6 }}>⚕️ This is an AI-powered informational assessment only. Always consult a qualified doctor for proper diagnosis and treatment.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ASK BEFORE YOU BOOK ── */}
      {activeTab === "abb" && (
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius:14, padding:"18px 22px", marginBottom:24, display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:"white", marginBottom:2 }}>Ask Before You Book</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>Answer 5 quick questions to find out if you need a doctor visit or can manage at home</p>
            </div>
          </div>

          {!abbResult ? (
            <div>
              {/* Progress */}
              <div style={{ display:"flex", gap:8, marginBottom:24 }}>
                {ABB_QUESTIONS.map((_,i) => (
                  <div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<=abbStep?"#7c3aed":"#e5e7eb", transition:"background 0.3s" }}/>
                ))}
              </div>

              <div style={{ background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:"24px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Question {abbStep+1} of {ABB_QUESTIONS.length}</p>
                <p style={{ fontSize:18, fontWeight:700, color:"#111827", lineHeight:1.4, marginBottom:20 }}>{ABB_QUESTIONS[abbStep].text}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {ABB_QUESTIONS[abbStep].options.map((opt,i) => (
                    <button key={i} className="abb-option" onClick={()=>abbAnswer(opt)}>{opt}</button>
                  ))}
                </div>
              </div>

              {abbStep > 0 && (
                <button onClick={()=>{setAbbStep(abbStep-1);setAbbAnswers(abbAnswers.slice(0,-1));}} style={{ marginTop:12, padding:"8px 16px", background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                  ← Back
                </button>
              )}
            </div>
          ) : (
            <div className="fade-in" style={{ background:abbResult.bg, borderRadius:16, border:"1px solid #e5e7eb", padding:"32px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>{abbResult.icon}</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:abbResult.color, marginBottom:12 }}>{abbResult.title}</h2>
              <p style={{ fontSize:15, color:"#374151", lineHeight:1.7, marginBottom:24, maxWidth:400, margin:"0 auto 24px" }}>{abbResult.msg}</p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                {abbResult.type !== "selfcare" && (
                  <button onClick={()=>navigate("/search-doctors")} style={{ padding:"12px 24px", background:abbResult.color, color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                    Find a Doctor →
                  </button>
                )}
                <button onClick={()=>{setAbbStep(0);setAbbAnswers([]);setAbbResult(null);}} style={{ padding:"12px 24px", background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                  Start Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
