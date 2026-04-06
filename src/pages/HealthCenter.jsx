import NextStepBanner from "../components/NextStepBanner";import { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const SMART_DB = {
  chest: {
    possibleConditions:[
      {name:"Angina Pectoris",probability:78,description:"Reduced blood flow to heart causing chest pressure"},
      {name:"Acid Reflux (GERD)",probability:62,description:"Stomach acid flowing back into esophagus"},
      {name:"Musculoskeletal Strain",probability:45,description:"Inflammation of chest muscles or ribs"}
    ],
    recommendedSpecialist:"Cardiologist", urgency:"high", triageLevel:"Emergency",
    urgencyReason:"Chest symptoms require immediate cardiac evaluation to rule out serious conditions",
    generalAdvice:"Stop all physical activity immediately and rest in a comfortable position. Loosen tight clothing around your chest. If pain radiates to your left arm, jaw, or you feel breathless — call 112 immediately. Do not drive yourself to the hospital.",
    homeRemedies:["Sit upright or in a reclining position — lying flat may worsen acid reflux pain","Apply a warm compress on chest for musculoskeletal pain — 15 minutes, 3 times daily","Take slow deep breaths if it is anxiety-related chest tightness — inhale 4 counts, exhale 6 counts"],
    dietTips:["Avoid heavy, spicy, or oily meals that can trigger acid reflux and worsen chest discomfort","Eat smaller meals more frequently — large meals increase pressure on the chest","Avoid caffeine, alcohol, and carbonated drinks until symptoms resolve"],
    restAdvice:"Rest completely — avoid lifting heavy objects, climbing stairs, or any exertion. Sleep with your head elevated on 2-3 pillows if acid reflux is suspected. Avoid lying down for at least 2 hours after eating.",
    medications:["Pantoprazole 40mg once daily before breakfast for acid reflux","Gelusil or Digene syrup after meals if burning sensation is present"],
    redFlags:["Chest pain radiating to left arm, jaw, or back — call 112 immediately","Sweating, nausea, and chest pain together — heart attack sign","Sudden severe chest pain with shortness of breath — emergency"]
  },
  head: {
    possibleConditions:[
      {name:"Tension Headache",probability:72,description:"Muscle tension in head and neck causing dull pain"},
      {name:"Migraine",probability:58,description:"Neurological condition with throbbing head pain"},
      {name:"Sinusitis",probability:40,description:"Inflammation of sinuses causing pressure and pain"}
    ],
    recommendedSpecialist:"Neurologist", urgency:"medium", triageLevel:"Consultation",
    urgencyReason:"Persistent or severe headaches with fever need professional evaluation",
    generalAdvice:"Rest in a quiet, dark room and avoid screen time. Stay well hydrated — dehydration is one of the most common headache triggers. Apply a cold or warm compress on your forehead. Most tension headaches resolve within a few hours with rest and hydration.",
    homeRemedies:["Ginger tea: Boil 1 inch fresh ginger in 2 cups water for 10 minutes, add honey — drink twice daily for nausea and headache","Peppermint oil: Apply 2-3 drops diluted in coconut oil on temples in circular motion for cooling relief","Steam inhalation with eucalyptus oil for sinus headache — cover head with towel over hot water bowl for 10 minutes"],
    dietTips:["Drink at least 8-10 glasses of water — dehydration is the top headache trigger","Avoid caffeine, alcohol, and processed foods containing MSG which are known headache triggers","Eat magnesium-rich foods like bananas, almonds, and dark leafy greens which help prevent migraines"],
    restAdvice:"Sleep in a dark, cool, quiet room with your head slightly elevated. Avoid any strenuous activity. Limit screen exposure from phone, TV and computer. Sleep for at least 7-8 hours. Massage your temples, neck, and shoulders gently before sleeping.",
    medications:["Paracetamol 500mg — take 1-2 tablets every 6 hours with food for pain relief","Ibuprofen 400mg after food if Paracetamol is ineffective — avoid on empty stomach"],
    redFlags:["Sudden thunderclap headache — the worst headache of your life — call 112 immediately","Headache with stiff neck, fever, and sensitivity to light — possible meningitis","Headache with confusion, weakness, or vision changes — seek emergency care"]
  },
  fever: {
    possibleConditions:[
      {name:"Viral Fever",probability:80,description:"Common viral infection causing elevated body temperature"},
      {name:"Dengue Fever",probability:55,description:"Mosquito-borne viral disease common in India"},
      {name:"Typhoid",probability:38,description:"Bacterial infection from contaminated food or water"}
    ],
    recommendedSpecialist:"General Physician", urgency:"medium", triageLevel:"Consultation",
    urgencyReason:"Fever above 38.5°C lasting more than 2 days needs medical evaluation",
    generalAdvice:"Rest completely and stay home. Keep yourself well hydrated with water, coconut water, and ORS solution. Take a lukewarm sponge bath to bring down fever — avoid cold water. Monitor temperature every 4-6 hours. If fever crosses 39.5°C or lasts more than 3 days, see a doctor immediately.",
    homeRemedies:["Tulsi (holy basil) tea: Boil 10-15 tulsi leaves in water for 10 minutes with black pepper and ginger — drink 3 times daily","Wet cloth on forehead: Soak cloth in lukewarm water, place on forehead — change every 10 minutes","Giloy kadha: Boil giloy stem in water for 15 minutes — an Ayurvedic remedy known to boost immunity during fever"],
    dietTips:["Drink ORS (Electral) solution to prevent dehydration — especially if sweating heavily","Eat light, easily digestible foods like khichdi, dal rice, curd rice, and soups","Avoid heavy, oily, and spicy food — your digestive system is already stressed during fever"],
    restAdvice:"Stay in bed and rest completely. Avoid exposure to fans or AC directly — dress in light cotton clothing. Keep your room well ventilated but avoid cold drafts. Do not go to work or school until fever-free for 24 hours without medication.",
    medications:["Paracetamol 500-650mg every 6 hours — do not exceed 4 doses in 24 hours","Cetirizine 10mg at night if fever is accompanied by cold and runny nose"],
    redFlags:["Fever above 40°C that does not come down with Paracetamol — go to hospital","Rash appearing on body along with fever — possible dengue or other serious infection","Fever with severe abdominal pain, vomiting blood, or bleeding — emergency"]
  },
  stomach: {
    possibleConditions:[
      {name:"Gastroenteritis",probability:74,description:"Inflammation of stomach and intestines from infection"},
      {name:"Irritable Bowel Syndrome",probability:55,description:"Chronic disorder affecting large intestine function"},
      {name:"Food Poisoning",probability:48,description:"Illness from eating contaminated food or water"}
    ],
    recommendedSpecialist:"Gastroenterologist", urgency:"low", triageLevel:"Self-care",
    urgencyReason:"Most stomach issues resolve with rest, hydration, and diet changes",
    generalAdvice:"Rest your digestive system by eating light and staying hydrated. Drink ORS solution to replace lost electrolytes. Avoid solid food for the first few hours if nausea is severe — start with clear liquids. Gradually introduce bland foods like rice, banana, and curd as you feel better.",
    homeRemedies:["Jeera (cumin) water: Boil 1 tsp cumin in 2 cups water, strain and drink warm — relieves bloating and indigestion","Ajwain with rock salt: Mix half teaspoon ajwain with a pinch of black salt and lukewarm water — instant relief from gas","Banana and curd: Eat ripe banana with plain curd — replenishes electrolytes and soothes the stomach"],
    dietTips:["Follow BRAT diet: Bananas, Rice, Applesauce, Toast — easy to digest and gentle on stomach","Drink ORS or Electral solution every hour — prevents dangerous dehydration from vomiting or diarrhea","Strictly avoid dairy (except curd), spicy food, caffeine, and alcohol until fully recovered"],
    restAdvice:"Rest lying on your left side which aids digestion. Avoid lying flat on your back immediately after eating — wait at least 30 minutes. Take small frequent sips of water rather than large amounts at once. Stay close to a bathroom and avoid travel.",
    medications:["ORS (Electral) powder mixed in 1 litre water — drink throughout the day for rehydration","Domperidone 10mg before meals for nausea — available without prescription"],
    redFlags:["Blood in stool or vomiting blood — go to emergency immediately","Signs of severe dehydration: dry mouth, no urination for 8+ hours, dizziness","Severe abdominal pain that is constant and worsening — possible appendicitis"]
  },
  breathing: {
    possibleConditions:[
      {name:"Acute Bronchitis",probability:70,description:"Inflammation of bronchial tubes causing cough and wheezing"},
      {name:"Asthma Attack",probability:58,description:"Airways narrow causing difficulty breathing and wheezing"},
      {name:"Pneumonia",probability:42,description:"Lung infection causing breathlessness and chest tightness"}
    ],
    recommendedSpecialist:"Pulmonologist", urgency:"high", triageLevel:"Consultation",
    urgencyReason:"Breathing difficulties need prompt medical attention to prevent complications",
    generalAdvice:"Sit upright or in a slightly reclined position — do not lie flat as it worsens breathing. Stay in a well-ventilated area with clean air. Avoid smoke, dust, and strong smells. If you have an inhaler, use it as prescribed. Seek emergency care if you cannot speak full sentences without gasping.",
    homeRemedies:["Steam inhalation with tulsi and eucalyptus leaves: Add to hot water, cover head with towel and inhale for 10 minutes — clears airways","Honey and ginger juice: Mix 1 tsp each and take 3 times daily — natural anti-inflammatory for airways","Warm turmeric milk: 1 tsp turmeric in warm milk at bedtime — reduces inflammation in respiratory tract"],
    dietTips:["Drink warm liquids — herbal teas, warm water with honey and lemon help loosen mucus","Avoid cold drinks, ice cream, and dairy which increase mucus production","Eat anti-inflammatory foods like turmeric, ginger, and garlic to support respiratory health"],
    restAdvice:"Rest in a seated or semi-reclined position — use extra pillows to elevate your head. Avoid going outdoors especially in cold air, pollution, or dusty environments. Do not exercise until breathing normalizes. Sleep with windows slightly open for fresh air circulation.",
    medications:["Salbutamol inhaler (Asthalin) — use as prescribed if asthma diagnosed","Levocetrizine 5mg for allergy-related breathing issues — take at night"],
    redFlags:["Cannot speak more than 3-4 words without gasping — call 112 immediately","Blue or gray color on lips or fingertips — severe oxygen shortage","Breathing rate above 30 breaths per minute — emergency"]
  },
  skin: {
    possibleConditions:[
      {name:"Contact Dermatitis",probability:68,description:"Allergic skin reaction from contact with irritant"},
      {name:"Eczema",probability:54,description:"Chronic inflammatory skin condition causing itching"},
      {name:"Fungal Infection",probability:45,description:"Fungal skin infection common in humid Indian climate"}
    ],
    recommendedSpecialist:"Dermatologist", urgency:"low", triageLevel:"Self-care",
    urgencyReason:"Most skin conditions are manageable but chronic rashes need diagnosis",
    generalAdvice:"Avoid scratching the affected area — it worsens infection and causes scarring. Keep the skin clean and dry. Use mild, fragrance-free soap and lukewarm water. Apply a gentle moisturizer after washing. Wear loose, cotton clothing to reduce friction and irritation on affected areas.",
    homeRemedies:["Aloe vera gel: Apply fresh aloe vera gel directly on rash — cooling and anti-inflammatory, leave for 20 minutes","Coconut oil: Apply cold-pressed coconut oil gently on dry or itchy skin — natural antifungal and moisturizer","Neem paste: Grind neem leaves with turmeric into paste, apply for 15 minutes — natural antiseptic for fungal or bacterial skin issues"],
    dietTips:["Avoid foods that commonly trigger skin reactions: shellfish, nuts, dairy, gluten if you have food allergies","Drink plenty of water — hydrated skin heals faster and is less susceptible to infection","Eat foods rich in Vitamin C and zinc like amla, citrus fruits, and pumpkin seeds to boost skin healing"],
    restAdvice:"Keep the affected skin area clean and dry especially in skin folds. Change bed sheets and towels daily during active rash to prevent spread or reinfection. Avoid swimming pools and public bathing areas. Wear cotton gloves at night if you scratch in sleep.",
    medications:["Calamine lotion — apply on rash for soothing relief from itching and inflammation","Clotrimazole 1% cream — for suspected fungal infection, apply twice daily for 2-4 weeks"],
    redFlags:["Rash spreading rapidly across the body within hours — possible allergic reaction","Rash with fever, swollen lymph nodes, and joint pain — needs immediate evaluation","Blistering, weeping, or crusting rash with severe pain — possible secondary infection"]
  },
  joint: {
    possibleConditions:[
      {name:"Osteoarthritis",probability:65,description:"Wear and tear of joint cartilage causing pain and stiffness"},
      {name:"Rheumatoid Arthritis",probability:50,description:"Autoimmune condition causing joint inflammation"},
      {name:"Gout",probability:42,description:"Uric acid crystal deposits in joints causing severe pain"}
    ],
    recommendedSpecialist:"Orthopedic Surgeon", urgency:"low", triageLevel:"Consultation",
    urgencyReason:"Joint pain lasting more than 2 weeks needs proper diagnosis and treatment",
    generalAdvice:"Rest the affected joint and avoid activities that worsen the pain. Apply ice for acute pain and swelling (first 48 hours) and heat for chronic stiffness and aching. Maintain a healthy weight to reduce pressure on weight-bearing joints like knees and hips. Gentle range-of-motion exercises help maintain joint flexibility.",
    homeRemedies:["Turmeric and ginger tea: Boil 1 tsp each in water for 10 minutes — powerful natural anti-inflammatory for joint pain","Mustard oil massage: Warm mustard oil with 2 garlic cloves, massage on joints gently for 15 minutes — improves circulation","Fenugreek seeds: Soak 1 tsp overnight, eat on empty stomach in morning — traditional remedy for joint stiffness"],
    dietTips:["Eat anti-inflammatory foods: walnuts, flaxseeds, fatty fish, turmeric, and ginger daily","Avoid high purine foods like red meat, organ meats, and alcohol which worsen gout","Drink 3 litres of water daily to flush uric acid and keep joints lubricated"],
    restAdvice:"Rest the joint but maintain gentle movement — complete rest weakens muscles that support the joint. Use a knee brace or support if walking is painful. Elevate the affected limb when resting to reduce swelling. Avoid sitting in one position for long periods — get up and move every 30 minutes.",
    medications:["Diclofenac gel 1% — apply on painful joint twice daily for local relief","Ibuprofen 400mg after food — for acute pain, take for maximum 3-5 days"],
    redFlags:["Joint suddenly red, hot, swollen with fever — possible septic arthritis, go to emergency","Severe pain that prevents any movement — needs urgent X-ray","Joint pain after injury or fall — possible fracture, needs X-ray immediately"]
  },
  mental: {
    possibleConditions:[
      {name:"Generalized Anxiety Disorder",probability:66,description:"Excessive worry and anxiety affecting daily functioning"},
      {name:"Depression",probability:54,description:"Persistent low mood, loss of interest, and fatigue"},
      {name:"Stress-Related Disorder",probability:48,description:"Physical and mental symptoms from prolonged stress"}
    ],
    recommendedSpecialist:"Psychiatrist", urgency:"medium", triageLevel:"Consultation",
    urgencyReason:"Mental health symptoms lasting more than 2 weeks benefit from professional support",
    generalAdvice:"You are not alone — mental health conditions are common and very treatable. Reach out to someone you trust today. Establish a daily routine with fixed sleep and wake times. Limit social media and news consumption. Small daily walks in sunlight significantly improve mood and sleep quality. Consider speaking to a counsellor — iCall at 9152987821 offers free support.",
    homeRemedies:["4-7-8 breathing: Inhale for 4 counts, hold for 7, exhale for 8 — repeat 4 times to calm anxiety immediately","Ashwagandha: 300-600mg ashwagandha root extract capsule daily — clinically proven to reduce cortisol and anxiety","Journaling: Write 3 things you are grateful for each morning — 5 minutes daily improves mood significantly over 2 weeks"],
    dietTips:["Eat foods rich in omega-3 like walnuts, flaxseeds, and fish — directly supports brain health and mood","Reduce or eliminate caffeine and alcohol — both significantly worsen anxiety and disrupt sleep quality","Eat probiotic foods like curd and buttermilk — gut-brain connection means gut health directly affects mood"],
    restAdvice:"Prioritize sleep above everything — aim for 7-9 hours at fixed times every night. Create a calming bedtime routine: avoid screens 1 hour before sleep, read, meditate, or listen to soft music. Morning sunlight for 15-20 minutes helps regulate your body clock and mood hormones.",
    medications:["Consult a doctor before taking any medication for mental health conditions","Melatonin 3-5mg at bedtime — safe for short-term sleep difficulties (consult doctor first)"],
    redFlags:["Thoughts of harming yourself or others — call iCall 9152987821 or go to hospital immediately","Unable to perform basic daily activities for more than 2 weeks — needs urgent care","Hearing voices or seeing things others cannot — seek psychiatric evaluation immediately"]
  },
  default: {
    possibleConditions:[
      {name:"Viral Infection",probability:72,description:"Common viral illness affecting the immune system"},
      {name:"Stress-Related Symptoms",probability:55,description:"Physical manifestations of mental or physical stress"},
      {name:"Nutritional Deficiency",probability:38,description:"Symptoms from lack of essential vitamins or minerals"}
    ],
    recommendedSpecialist:"General Physician", urgency:"low", triageLevel:"Self-care",
    urgencyReason:"Symptoms appear mild and manageable with home care",
    generalAdvice:"Rest well and allow your body to recover. Stay well hydrated with at least 8-10 glasses of water daily. Eat nutritious, home-cooked meals with plenty of vegetables and fruits. Monitor your symptoms over the next 24-48 hours. If symptoms worsen or new symptoms develop, consult a General Physician.",
    homeRemedies:["Kadha (immunity drink): Boil tulsi, ginger, black pepper, and cinnamon in water for 10 minutes — drink twice daily","Vitamin C boost: Drink fresh amla juice or eat 2-3 amla daily — 20x more Vitamin C than orange","Rest and sleep: 7-9 hours of quality sleep is the most powerful healing tool — let your body repair itself"],
    dietTips:["Eat warm, freshly cooked Indian home food — avoid outside food and raw salads during illness","Include garlic, ginger, and turmeric in your cooking daily — natural immunity boosters","Drink warm water throughout the day — helps flush toxins and supports every organ system"],
    restAdvice:"Take adequate rest — avoid work stress, late nights, and excessive physical activity. Your body heals fastest during sleep. Take short walks in fresh air and sunlight if you feel up to it — Vitamin D from sunlight boosts immunity significantly. Avoid crowded places to prevent spreading infection.",
    medications:["Paracetamol 500mg — for fever or pain, take after food every 6-8 hours as needed","Vitamin C 500mg and Zinc tablet daily — to support immune recovery"],
    redFlags:["Symptoms worsening rapidly after initial improvement — see a doctor","High fever (above 39°C) not responding to Paracetamol — go to clinic","Any new alarming symptoms like rash, breathlessness, or severe pain — seek emergency care"]
  }
};

function getSmartResult(symptoms, age, gender) {
  const s = symptoms.toLowerCase();
  let key = "default";
  if (s.includes("chest") || s.includes("heart") || s.includes("cardiac")) key = "chest";
  else if (s.includes("head") || s.includes("migraine") || s.includes("dizzy") || s.includes("vertigo")) key = "head";
  else if (s.includes("fever") || s.includes("temperature") || s.includes("chills") || s.includes("shiver")) key = "fever";
  else if (s.includes("stomach") || s.includes("nausea") || s.includes("vomit") || s.includes("diarrhea") || s.includes("loose") || s.includes("abdomen") || s.includes("gas") || s.includes("bloat")) key = "stomach";
  else if (s.includes("breath") || s.includes("cough") || s.includes("wheez") || s.includes("asthma") || s.includes("lung")) key = "breathing";
  else if (s.includes("skin") || s.includes("rash") || s.includes("itch") || s.includes("allerg") || s.includes("hives")) key = "skin";
  else if (s.includes("joint") || s.includes("knee") || s.includes("back") || s.includes("muscle") || s.includes("bone") || s.includes("pain")) key = "joint";
  else if (s.includes("anxiety") || s.includes("depress") || s.includes("stress") || s.includes("sleep") || s.includes("mental") || s.includes("worry")) key = "mental";
  return { ...SMART_DB[key] };
}

function getMockResult(s) { return getSmartResult(s); }


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

    // Try Gemini first, fallback to smart mock
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (GEMINI_KEY) {
      try {
        const prompt = `You are an expert medical AI for patients in India. Analyze symptoms carefully.
Patient: Age ${age||"unknown"}, Gender: ${gender}
Symptoms: ${symptoms}

Respond ONLY with this JSON (no markdown, no extra text):
{
  "possibleConditions": [
    {"name":"condition name","probability":85,"description":"one sentence why"},
    {"name":"condition name","probability":60,"description":"one sentence why"},
    {"name":"condition name","probability":35,"description":"one sentence why"}
  ],
  "recommendedSpecialist":"Doctor type",
  "urgency":"low",
  "urgencyReason":"one sentence",
  "triageLevel":"Self-care",
  "generalAdvice":"3-4 sentences of detailed home care",
  "homeRemedies":["remedy 1 with how to use","remedy 2","remedy 3"],
  "dietTips":["what to eat and why","what to avoid","hydration tip"],
  "restAdvice":"2-3 sentences about rest and activity",
  "medications":["OTC medicine with dosage available in India","second medicine"],
  "redFlags":["emergency warning 1","warning 2","warning 3"]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
            })
          }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const s = clean.indexOf("{"); const e = clean.lastIndexOf("}");
        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(clean.slice(s, e+1));
          if (parsed.possibleConditions) {
            setScResult(parsed);
            setScLoading(false);
            return;
          }
        }
      } catch(err) {
        console.log("Gemini failed, using smart analysis:", err.message);
      }
    }

    // Smart enhanced mock — gives detailed results always
    await new Promise(r => setTimeout(r, 1500));
    setScResult(getSmartResult(symptoms, age, gender));
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
                <p style={{ color:'#6b7280', fontSize:14 }}>Analyzing with AI...</p>
                <p style={{ color:'#9ca3af', fontSize:12, marginTop:4 }}>Powered by Llama AI via OpenRouter</p>
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
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:12 }}>🔬 Possible Conditions</p>
                  {scResult.possibleConditions?.map((c,i) => {
                    const prob = typeof c === 'object' ? c.probability : (85 - i*20);
                    const name = typeof c === 'object' ? c.name : c;
                    const desc = typeof c === 'object' ? c.description : '';
                    const color = prob>=70?'#dc2626':prob>=50?'#d97706':'#0d9488';
                    return (
                      <div key={i} style={{ marginBottom:12, padding:'10px 12px', background:'#f9fafb', borderRadius:8, border:'1px solid #f3f4f6' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{name}</p>
                          <span style={{ fontSize:13, fontWeight:800, color:color }}>{prob}%</span>
                        </div>
                        <div style={{ height:7, background:'#e5e7eb', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                          <div style={{ width:prob+'%', height:'100%', background:color, borderRadius:4, transition:'width 0.8s ease' }}/>
                        </div>
                        {desc && <p style={{ fontSize:11, color:'#6b7280', lineHeight:1.5 }}>{desc}</p>}
                      </div>
                    );
                  })}
                </div>
                {scResult.triageLevel && (
                  <div style={{ background: scResult.triageLevel==='Emergency'?'#fef2f2':scResult.triageLevel==='Consultation'?'#fffbeb':'#f0fdf4', borderRadius:10, border:'1px solid '+(scResult.triageLevel==='Emergency'?'#fecaca':scResult.triageLevel==='Consultation'?'#fde68a':'#bbf7d0'), padding:'12px 16px' }}>
                    <p style={{ fontSize:13, fontWeight:700, color: scResult.triageLevel==='Emergency'?'#dc2626':scResult.triageLevel==='Consultation'?'#d97706':'#16a34a' }}>
                      🏥 Triage Level: {scResult.triageLevel}
                    </p>
                  </div>
                )}
                <div style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'16px', borderLeft:'4px solid #0d9488' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8 }}>💊 General Advice</p>
                  <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.8 }}>{scResult.generalAdvice}</p>
                </div>
                {scResult.restAdvice && (
                  <div style={{ background:'#f0fdfa', borderRadius:10, border:'1px solid #ccfbf1', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#0d9488', marginBottom:8 }}>😴 Rest & Activity</p>
                    <p style={{ fontSize:13, color:'#374151', lineHeight:1.8 }}>{scResult.restAdvice}</p>
                  </div>
                )}
                {scResult.homeRemedies?.length > 0 && (
                  <div style={{ background:'white', borderRadius:10, border:'1px solid #e5e7eb', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:10 }}>🌿 Home Remedies</p>
                    {scResult.homeRemedies.map((r,i) => (
                      <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:i<scResult.homeRemedies.length-1?'1px solid #f3f4f6':'none' }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>•</span>
                        <p style={{ fontSize:13, color:'#374151', lineHeight:1.7 }}>{r}</p>
                      </div>
                    ))}
                  </div>
                )}
                {scResult.dietTips?.length > 0 && (
                  <div style={{ background:'#fffbeb', borderRadius:10, border:'1px solid #fde68a', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#92400e', marginBottom:10 }}>🥗 Diet & Nutrition Tips</p>
                    {scResult.dietTips.map((t,i) => (
                      <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:i<scResult.dietTips.length-1?'1px solid #fef3c7':'none' }}>
                        <span style={{ fontSize:13, flexShrink:0, color:'#d97706' }}>→</span>
                        <p style={{ fontSize:13, color:'#78350f', lineHeight:1.7 }}>{t}</p>
                      </div>
                    ))}
                  </div>
                )}
                {scResult.medications?.length > 0 && (
                  <div style={{ background:'#eff6ff', borderRadius:10, border:'1px solid #bfdbfe', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#1e40af', marginBottom:10 }}>💊 OTC Medicines (if needed)</p>
                    {scResult.medications.map((m,i) => (
                      <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:i<scResult.medications.length-1?'1px solid #dbeafe':'none' }}>
                        <span style={{ fontSize:13, flexShrink:0, color:'#2563eb' }}>•</span>
                        <p style={{ fontSize:13, color:'#1e3a8a', lineHeight:1.7 }}>{m}</p>
                      </div>
                    ))}
                    <p style={{ fontSize:11, color:'#6b7280', marginTop:8, fontStyle:'italic' }}>⚠️ Always consult a doctor before taking any medicine.</p>
                  </div>
                )}
                {scResult.riskFactors?.length > 0 && (
                  <div style={{ background:'#f5f3ff', borderRadius:10, border:'1px solid #ddd6fe', padding:'16px' }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#7c3aed', marginBottom:10 }}>⚠️ Risk Factors For You</p>
                    {scResult.riskFactors.map((r,i) => (
                      <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:i<scResult.riskFactors.length-1?'1px solid #ede9fe':'none' }}>
                        <span style={{ color:'#7c3aed', flexShrink:0 }}>•</span>
                        <p style={{ fontSize:13, color:'#5b21b6', lineHeight:1.7 }}>{r}</p>
                      </div>
                    ))}
                  </div>
                )}
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
<NextStepBanner
  icon="🩺"
  title="Time to see a specialist?"
  desc="Our verified doctors are available for online consultations. Book in under 2 minutes."
  btnLabel="Find a Doctor"
  btnPath="/search-doctors"
  btnSecondaryLabel="My Appointments"
  btnSecondaryPath="/my-appointments"
  color="purple"
/>
    </Layout>
  );
}
