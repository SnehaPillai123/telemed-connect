with open('src/pages/HealthCenter.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
start = c.find('  const analyzeSymptoms = async () => {')
end = c.find('    setScLoading(false);\n  };', start) + 29
new = '''  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setScLoading(true); setScResult(null);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": "Bearer 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"},
        body: JSON.stringify({model: "meta-llama/llama-3.2-3b-instruct:free", messages: [{role: "system", content: "You are medical AI for India. Return ONLY JSON with fields: possibleConditions, recommendedSpecialist, urgency, urgencyReason, generalAdvice, homeRemedies, dietTips, restAdvice, medications, redFlags"}, {role: "user", content: "Age: " + (age||"unknown") + ", Gender: " + gender + ", Symptoms: " + symptoms}]})
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const s = text.indexOf("{"); const e = text.lastIndexOf("}");
      if(s>-1&&e>-1){const p=JSON.parse(text.slice(s,e+1)); if(p.possibleConditions){setScResult(p);}else{setScResult(getMockResult(symptoms));}}
      else{setScResult(getMockResult(symptoms));}
    } catch(e){setScResult(getMockResult(symptoms));}
    setScLoading(false);
  };'''
result = c[:start] + new + c[end:]
with open('src/pages/HealthCenter.jsx', 'w', encoding='utf-8') as f:    f.write(result)
print('Done!' if 'openrouter' in result else 'Failed!')