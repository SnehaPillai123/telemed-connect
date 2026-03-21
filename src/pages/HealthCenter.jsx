import { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const MOCK_RESPONSES = {
  default: { possibleConditions:["Viral infection","Common cold","Seasonal allergies"], recommendedSpecialist:"General Physician", urgency:"low", urgencyReason:"Symptoms appear mild and manageable", generalAdvice:"Rest well and stay hydrated. Monitor symptoms for 48 hours.", redFlags:["High fever above 103°F","Difficulty breathing","Chest pain"] },
  chest: { possibleConditions:["Angina","Acid reflux","Musculoskeletal strain"], recommendedSpecialist:"Cardiologist", urgency:"high", urgencyReason:"Chest symptoms require prompt cardiac evaluation", generalAdvice:"Avoid strenuous activity until assessed by a doctor.", redFlags:["Pain radiating to arm or jaw","Sweating with chest pain","Sudden severe pain"] },
  skin: { possibleConditions:["Eczema","Contact dermatitis","Psoriasis","Fungal infection"], recommendedSpecialist:"Dermatologist", urgency:"low", urgencyReason:"Skin conditions are generally non-urgent unless spreading rapidly", generalAdvice:"Avoid scratching. Keep skin moisturized.", redFlags:["Rapidly spreading rash","Fever with skin changes","Blistering"] },
  head: { possibleConditions:["Tension headache","Migraine","Sinusitis"], recommendedSpecialist:"Neurologist", urgency:"medium", urgencyReason:"Persistent headaches warrant professional evaluation", generalAdvice:"Rest in a quiet, dark room. Stay hydrated.", redFlags:["Sudden severe headache","Headache with stiff neck","Confusion"] },
  stomach: { possibleConditions:["Gastritis","IBS","Food intolerance"], recommendedSpecialist:"General Physician", urgency:"low", urgencyReason:"Digestive symptoms are usually manageable", generalAdvice:"Eat small meals and avoid spicy foods.", redFlags:["Blood in stool","Severe abdominal pain","Unexplained weight loss"] },
  breathing: { possibleConditions:["Asthma","Bronchitis","Respiratory infection"], recommendedSpecialist:"Pulmonologist", urgency:"high", urgencyReason:"Breathing difficulties require prompt attention", generalAdvice:"Avoid respiratory irritants like smoke.", redFlags:["Severe shortness of breath","Blue lips or fingertips"] },
  joint: { possibleConditions:["Arthritis","Tendinitis","Ligament strain"], recommendedSpecialist:"Orthopedic", urgency:"low", urgencyReason:"Joint pain is usually manageable with rest", generalAdvice:"Rest the joint and apply ice.", redFlags:["Severe swelling with fever","Inability to bear weight"] },
  mental: { possibleConditions:["Anxiety disorder","Depression","Stress-related symptoms"], recommendedSpecialist:"Psychiatrist", urgency:"medium", urgencyReason:"Mental health symptoms benefit from early professional support", generalAdvice:"Prioritize sleep and regular exercise.", redFlags:["Thoughts of self-harm","Complete social withdrawal"] },
};

function getMockResult(s) {
  const l = s.toLowerCase();
  if (l.includes("chest")||l.includes("heart")) return MOCK_RESPONSES.chest;
  if (l.includes("skin")||l.includes("rash")||l.includes("itch")) return MOCK_RESPONSES.skin;
  if (l.includes("head")||l.includes("migraine")||l.includes("dizzy")) return MOCK_RESPONSES.head;
  if (l.includes("stomach")||l.includes("nausea")||l.includes("abdomen")) return MOCK_RESPONSES.stomach;
  if (l.includes("breath")||l.includes("cough")||l.includes("asthma")) return MOCK_RESPONSES.breathing;
  if (l.includes("joint")||l.includes("knee")||l.includes("back")||l.includes("muscle")) return MOCK_RESPONSES.joint;
  if (l.includes("anxiety")||l.includes("depress")||l.includes("stress")||l.includes("sleep")) return MOCK_RESPONSES.mental;
  return MOCK_RESPONSES.default;
}

const ABB_QUESTIONS = [
  { id:'duration', text:'How long have you had these symptoms?', options:['Less than 24 hours','1-3 days','3-7 days','More than a week'] },
  { id:'severity', text:'How severe are your symptoms?', options:['Mild - manageable','Moderate - affecting daily life','Severe - need immediate help','Very severe - emergency'] },
  { id:'fever', text:'Do you have a fever?', options:['No fever','Low grade (below 38°C)','High fever (38-39°C)','Very high (above 39°C)'] },
  { id:'previous', text:'Have you had this condition before?', options:['Yes, and I know how to manage it','Yes, but it was more mild','No, first time','Not sure'] },
  { id:'medication', text:'Have you tried any remedies or medication?', options:['Yes, it helped','Yes, no improvement',"No, haven't tried",'Taking prescribed medication'] },
];

function getABBResult(answers) {
  let urgent=0,consult=0,selfcare=0;
  if(answers.duration==='More than a week') urgent+=2;
  if(answers.duration==='3-7 days') consult+=1;
  if(answers.severity==='Very severe - emergency') urgent+=3;
  if(answers.severity==='Severe - need immediate help') urgent+=2;
  if(answers.severity==='Moderate - affecting daily life') consult+=2;
  if(answers.severity==='Mild - manageable') selfcare+=2;
  if(answers.fever==='Very high (above 39°C)') urgent+=2;
  if(answers.fever==='High fever (38-39°C)') consult+=1;
  if(answers.previous==='Yes, and I know how to manage it') selfcare+=2;
  if(answers.medication==='Yes, no improvement') consult+=2;
  if(answers.medication==='Yes, it helped') selfcare+=1;
  if(urgent>=3) return { type:'urgent', title:'Seek Medical Care Now', message:'Your symptoms suggest you need prompt medical attention. Please consult a doctor today.', action:'Book Consultation Now', color:'#dc2626', bg:'#fef2f2', border:'#fecaca' };
  if(consult>=2||selfcare<3) return { type:'consult', title:'Consultation Recommended', message:"Your symptoms would benefit from a doctor's opinion. Book within 24-48 hours.", action:'Book Consultation', color:'#d97706', bg:'#fffbeb', border:'#fde68a' };
  return { type:'selfcare', title:'Self-Care May Be Sufficient', message:'Your symptoms appear mild. Rest, hydration, and over-the-counter remedies may help.', action:'Find a Doctor Anyway', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' };
}

export default function HealthCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("symptom-checker");

  // Symptom Checker state
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [scResult, setScResult] = useState(null);
  const [scLoading, setScLoading] = useState(false);

  // Ask Before Book state
  const [abbStep, setAbbStep] = useState(0);
  const [abbAnswers, setAbbAnswers] = useState({});
  const [abbSymptom, setAbbSymptom] = useState("");
  const [abbResult, setAbbResult] = useState(null);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setScLoading(true); setScResult(null);
    await new Promise(r=>setTimeout(r,1800));
    setScResult(getMockResult(symptoms));
    setScLoading(false);
  };

  const handleABBAnswer = (qId, answer) => {
    const newAnswers = { ...abbAnswers, [qId]:answer };
    setAbbAnswers(newAnswers);
    if (abbStep < ABB_QUESTIONS.length-1) setTimeout(()=>setAbbStep(s=>s+1), 250);
    else setTimeout(()=>setAbbResult(getABBResult(newAnswers)), 250);
  };

  const resetABB = () => { setAbbStep(0); setAbbAnswers({}); setAbbSymptom(""); setAbbResult(null); };

  const URGENCY_STYLE = {
    low:    { bg:'#f0fdfa', color:'#0d9488', border:'#ccfbf1', label:'Low Urgency' },
    medium: { bg:'#fffbeb', color:'#d97706', border:'#fde68a', label:'Medium Urgency' },
    high:   { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', label:'High Urgency — Seek care soon' },
  };

  return (
    <Layout title="Health Center" subtitle="Health Tools">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .form-input { width:100%; padding:11px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; color:#111827; background:white; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; }
        .form-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
        .analyze-btn { width:100%; padding:12px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif; }
        .analyze-btn:hover { background:#0f766e; }
        .analyze-btn:disabled { background:#5eead4; cursor:not-allowed; }
        .option-btn { width:100%; text-align:left; padding:12px 14px; background:white; border:1.5px solid #e5e7eb; border-radius:9px; font-size:13px; font-weight:500; color:#374151; cursor:pointer; transition:all 0.15s; font-family:Inter,sans-serif; display:flex; align-items:center; gap:10px; }
        .option-btn:hover { border-color:#0d9488; color:#0d9488; background:#f0fdfa; }
        .option-btn.selected { border-color:#0d9488; background:#f0fdfa; color:#0d9488; font-weight:600; }
        label { font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px; }
      `}</style>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab==='symptom-checker'?'active':''}`} onClick={()=>setActiveTab('symptom-checker')}>
          🤒 Symptom Checker (AI)
        </button>
        <button className={`tab-btn ${activeTab==='ask-before-book'?'active':''}`} onClick={()=>setActiveTab('ask-before-book')}>
          ❓ Ask Before You Book
        </button>
      </div>

      {/* SYMPTOM CHECKER TAB */}
      {activeTab === 'symptom-checker' && (
        <div className="grid-2col">
          <section>
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'22px', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:18, paddingBottom:14, borderBottom:'1px solid #f3f4f6' }}>Describe Your Symptoms</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label htmlFor="age">Age</label><input id="age" className="form-input" type="number" placeholder="25" value={age} onChange={e=>setAge(e.target.value)} min="1" max="120"/></div>
                  <div><label htmlFor="gender">Gender</label>
                    <select id="gender" className="form-input" value={gender} onChange={e=>setGender(e.target.value)}>
                      <option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div><label htmlFor="symptoms">Your symptoms</label>
                  <textarea id="symptoms" className="form-input" value={symptoms} onChange={e=>setSymptoms(e.target.value)}
                    placeholder="e.g. I have been experiencing chest pain for 2 days, shortness of breath when walking..."
                    rows={5} style={{ resize:'vertical' }}/>
                </div>
                <button className="analyze-btn" onClick={analyzeSymptoms} disabled={scLoading||!symptoms.trim()}>
                  {scLoading ? "Analyzing..." : "✨ Analyze Symptoms"}
                </button>
              </div>
            </div>
            <div style={{ background:'#fffbeb', borderRadius:10, padding:14, border:'1px solid #fde68a', borderLeft:'4px solid #f59e0b' }}>
              <p style={{ fontSize:12, fontWeight:600, color:'#92400e', marginBottom:3 }}>Medical Disclaimer</p>
              <p style={{ fontSize:12, color:'#78350f', lineHeight:1.6 }}>This tool is for informational purposes only and does not replace professional medical advice. Always consult a qualified doctor.</p>
            </div>
          </section>

          <section aria-live="polite">
            {scLoading && (
              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                <div style={{ width:36, height:36, border:'3px solid #e5e7eb', borderTopColor:'#0d9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                <p style={{ color:'#6b7280', fontSize:14 }}>Analyzing your symptoms...</p>
              </div>
            )}
            {scResult && !scLoading && (
              <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(() => { const us=URGENCY_STYLE[scResult.urgency]||URGENCY_STYLE.low; return (
                  <div style={{ background:us.bg, borderRadius:10, padding:'12px 16px', border:`1px solid ${us.border}`, borderLeft:`4px solid ${us.color}` }}>
                    <p style={{ fontSize:13, fontWeight:700, color:us.color }}>{us.label}</p>
                    <p style={{ fontSize:12, color:us.color, opacity:0.85, marginTop:2 }}>{scResult.urgencyReason}</p>
                  </div>
                );})()}
                <div style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'16px', borderTop:'3px solid #0d9488' }}>
                  <p style={{ fontSize:11, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Recommended Specialist</p>
                  <p style={{ fontSize:18, fontWeight:700, color:'#0d9488', marginBottom:12 }}>{scResult.recommendedSpecialist}</p>
                  <button onClick={()=>navigate('/search-doctors')} style={{ padding:'9px 18px', background:'#0d9488', color:'white', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                    Find {scResult.recommendedSpecialist}
                  </button>
                </div>
                <div style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'16px' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:10 }}>Possible Conditions</p>
                  {scResult.possibleConditions?.map((c,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:i<scResult.possibleConditions.length-1?'1px solid #f3f4f6':'none' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#0d9488', flexShrink:0 }}/>
                      <p style={{ fontSize:13, color:'#374151' }}>{c}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'16px', borderLeft:'4px solid #0d9488' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8 }}>General Advice</p>
                  <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{scResult.generalAdvice}</p>
                </div>
                {scResult.redFlags?.length>0 && (
                  <div style={{ background:'#fef2f2', borderRadius:10, border:'1px solid #fecaca', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#dc2626', marginBottom:8 }}>Seek immediate care if:</p>
                    {scResult.redFlags.map((f,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:i<scResult.redFlags.length-1?'1px solid #fee2e2':'none' }}>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:'#dc2626', flexShrink:0 }}/>
                        <p style={{ fontSize:12, color:'#991b1b' }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!scLoading && !scResult && (
              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:12, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#0d9488" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827' }}>Ready to analyze</p>
                <p style={{ fontSize:13, color:'#9ca3af' }}>Enter your symptoms on the left to get AI-powered analysis and specialist recommendation</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ASK BEFORE BOOK TAB */}
      {activeTab === 'ask-before-book' && (
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          {!abbResult && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:13, color:'#6b7280', fontWeight:500 }}>Question {abbStep+1} of {ABB_QUESTIONS.length}</span>
                <span style={{ fontSize:13, color:'#0d9488', fontWeight:600 }}>{Math.round((abbStep/ABB_QUESTIONS.length)*100)}% complete</span>
              </div>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:4 }}>
                <div style={{ width:`${(abbStep/ABB_QUESTIONS.length)*100}%`, height:'100%', background:'linear-gradient(90deg,#0d9488,#0284c7)', borderRadius:4, transition:'width 0.4s ease' }}/>
              </div>
            </div>
          )}

          {!abbResult && abbStep===0 && (
            <div style={{ marginBottom:18 }}>
              <label>Briefly describe what's bothering you:</label>
              <textarea value={abbSymptom} onChange={e=>setAbbSymptom(e.target.value)}
                placeholder="e.g. I have a headache and mild fever since yesterday..."
                rows={3}
                style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:14, color:'#111827', outline:'none', resize:'vertical', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}
                onFocus={e=>e.target.style.borderColor='#0d9488'}
                onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
          )}

          {!abbResult && (
            <div className="fade-in" key={abbStep}>
              <div style={{ background:'white', borderRadius:14, border:'1px solid #e5e7eb', padding:'26px', marginBottom:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:20 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#f0fdfa', border:'1px solid #ccfbf1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:'#0d9488' }}>{abbStep+1}</span>
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', lineHeight:1.4 }}>{ABB_QUESTIONS[abbStep].text}</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ABB_QUESTIONS[abbStep].options.map((opt,i) => (
                    <button key={i} className={`option-btn ${abbAnswers[ABB_QUESTIONS[abbStep].id]===opt?'selected':''}`} onClick={()=>handleABBAnswer(ABB_QUESTIONS[abbStep].id,opt)}>
                      <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${abbAnswers[ABB_QUESTIONS[abbStep].id]===opt?'#0d9488':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:abbAnswers[ABB_QUESTIONS[abbStep].id]===opt?'#0d9488':'white' }}>
                        {abbAnswers[ABB_QUESTIONS[abbStep].id]===opt && <svg width="8" height="8" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {abbStep>0 && (
                <button onClick={()=>setAbbStep(s=>s-1)} style={{ background:'none', border:'none', fontSize:13, color:'#6b7280', cursor:'pointer', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Previous
                </button>
              )}
            </div>
          )}

          {abbResult && (
            <div className="fade-in">
              <div style={{ background:abbResult.bg, borderRadius:14, border:`2px solid ${abbResult.border}`, padding:'30px', marginBottom:18, textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:abbResult.color, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                    {abbResult.type==='selfcare'?<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round"/>:
                     abbResult.type==='urgent'?<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" strokeWidth="2" strokeLinecap="round"/>:
                     <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round"/>}
                  </svg>
                </div>
                <h2 style={{ fontSize:21, fontWeight:800, color:abbResult.color, marginBottom:10 }}>{abbResult.title}</h2>
                <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, maxWidth:460, margin:'0 auto 18px' }}>{abbResult.message}</p>
                {abbSymptom && (
                  <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:9, padding:'10px 14px', marginBottom:18, textAlign:'left' }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:2 }}>Your symptom:</p>
                    <p style={{ fontSize:13, color:'#6b7280', fontStyle:'italic' }}>"{abbSymptom}"</p>
                  </div>
                )}
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  <button onClick={()=>navigate('/search-doctors')} style={{ padding:'11px 22px', background:abbResult.color, color:'white', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{abbResult.action}</button>
                  <button onClick={resetABB} style={{ padding:'11px 22px', background:'white', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Start Over</button>
                </div>
              </div>
              <div style={{ background:'white', borderRadius:12, border:'1px solid #e5e7eb', padding:'18px' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:12 }}>Your Answers Summary</p>
                {ABB_QUESTIONS.map((q,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:i<ABB_QUESTIONS.length-1?'1px solid #f3f4f6':'none', gap:16 }}>
                    <p style={{ fontSize:12, color:'#6b7280', flex:1 }}>{q.text}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:'#111827', textAlign:'right', flexShrink:0 }}>{abbAnswers[q.id]||'—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
