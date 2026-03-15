import { useState } from "react";
import PatientSidebar from "../components/PatientSidebar";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  { id: 'duration', text: 'How long have you had these symptoms?', options: ['Less than 24 hours', '1-3 days', '3-7 days', 'More than a week'] },
  { id: 'severity', text: 'How severe are your symptoms?', options: ['Mild - manageable', 'Moderate - affecting daily life', 'Severe - need immediate help', 'Very severe - emergency'] },
  { id: 'fever', text: 'Do you have a fever?', options: ['No fever', 'Low grade (below 38°C)', 'High fever (38-39°C)', 'Very high (above 39°C)'] },
  { id: 'previous', text: 'Have you had this condition before?', options: ['Yes, and I know how to manage it', 'Yes, but it was more mild', 'No, first time', 'Not sure'] },
  { id: 'medication', text: 'Have you tried any home remedies or medication?', options: ['Yes, it helped', 'Yes, no improvement', "No, haven't tried", 'Taking prescribed medication'] },
];

const getResult = (answers) => {
  let urgent = 0, consult = 0, selfcare = 0;
  if (answers.duration === 'More than a week') urgent += 2;
  if (answers.duration === '3-7 days') consult += 1;
  if (answers.severity === 'Very severe - emergency') urgent += 3;
  if (answers.severity === 'Severe - need immediate help') urgent += 2;
  if (answers.severity === 'Moderate - affecting daily life') consult += 2;
  if (answers.severity === 'Mild - manageable') selfcare += 2;
  if (answers.fever === 'Very high (above 39°C)') urgent += 2;
  if (answers.fever === 'High fever (38-39°C)') consult += 1;
  if (answers.previous === 'Yes, and I know how to manage it') selfcare += 2;
  if (answers.medication === 'Yes, no improvement') consult += 2;
  if (answers.medication === 'Yes, it helped') selfcare += 1;
  if (urgent >= 3) return { type: 'urgent', title: 'Seek Medical Care Now', message: 'Your symptoms suggest you need prompt medical attention. Please consult a doctor today or visit an emergency room if symptoms are severe.', action: 'Book Consultation Now', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  if (consult >= 2 || selfcare < 3) return { type: 'consult', title: 'Consultation Recommended', message: "Your symptoms would benefit from a doctor's opinion. Book a consultation within the next 24-48 hours.", action: 'Book Consultation', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { type: 'selfcare', title: 'Self-Care May Be Sufficient', message: 'Based on your answers, your symptoms appear mild. Rest, hydration, and over-the-counter remedies may help. Monitor symptoms closely.', action: 'Find a Doctor Anyway', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
};

export default function AskBeforeBook() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState(null);

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) setTimeout(() => setStep(s => s + 1), 250);
    else setTimeout(() => setResult(getResult(newAnswers)), 250);
  };

  const reset = () => { setStep(0); setAnswers({}); setSymptom(''); setResult(null); };
  const progress = result ? 100 : (step / QUESTIONS.length) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .layout { display: flex; min-height: 100vh; background: #f9fafb; }
        .main { margin-left: 250px; flex: 1; }
        .option-btn { width: 100%; text-align: left; padding: 13px 16px; background: white; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; display: flex; align-items: center; gap: 12px; }
        .option-btn:hover { border-color: #0d9488; color: #0d9488; background: #f0fdfa; }
        .option-btn.selected { border-color: #0d9488; background: #f0fdfa; color: #0d9488; font-weight: 600; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
      `}</style>

      <div className="layout">
        <PatientSidebar />
        <main className="main">
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px' }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Smart Assistant</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Ask Before You Book</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Answer a few questions to find out if you need a doctor consultation.</p>
          </header>

          <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 32px' }}>

            {!result && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Question {step + 1} of {QUESTIONS.length}</span>
                  <span style={{ fontSize: 13, color: '#0d9488', fontWeight: 600 }}>{Math.round(progress)}% complete</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4 }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0d9488, #0284c7)', borderRadius: 4, transition: 'width 0.4s ease' }}/>
                </div>
              </div>
            )}

            {!result && step === 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Briefly describe what's bothering you:</label>
                <textarea value={symptom} onChange={e => setSymptom(e.target.value)}
                  placeholder="e.g. I have a headache and mild fever since yesterday..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => e.target.style.borderColor='#0d9488'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
              </div>
            )}

            {!result && (
              <div className="fade-in" key={step}>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0d9488' }}>{step + 1}</span>
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{QUESTIONS[step].text}</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {QUESTIONS[step].options.map((opt, i) => (
                      <button key={i} className={`option-btn ${answers[QUESTIONS[step].id] === opt ? 'selected' : ''}`} onClick={() => handleAnswer(QUESTIONS[step].id, opt)}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${answers[QUESTIONS[step].id] === opt ? '#0d9488' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: answers[QUESTIONS[step].id] === opt ? '#0d9488' : 'white' }}>
                          {answers[QUESTIONS[step].id] === opt && <svg width="9" height="9" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    Previous question
                  </button>
                )}
              </div>
            )}

            {result && (
              <div className="fade-in">
                <div style={{ background: result.bg, borderRadius: 16, border: `2px solid ${result.border}`, padding: '32px', marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: result.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                      {result.type === 'selfcare'
                        ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        : result.type === 'urgent'
                        ? <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        : <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round"/>}
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: result.color, marginBottom: 12 }}>{result.title}</h2>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 20px' }}>{result.message}</p>
                  {symptom && (
                    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Your symptom:</p>
                      <p style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>"{symptom}"</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/search-doctors')} style={{ padding: '11px 22px', background: result.color, color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{result.action}</button>
                    <button onClick={reset} style={{ padding: '11px 22px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start Over</button>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Your Answers Summary</p>
                  {QUESTIONS.map((q, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < QUESTIONS.length-1 ? '1px solid #f3f4f6' : 'none', gap: 16 }}>
                      <p style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{q.text}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right', flexShrink: 0 }}>{answers[q.id] || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
