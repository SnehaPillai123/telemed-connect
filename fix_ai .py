with open('src/pages/HealthCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '  const analyzeSymptoms = async () => {'
end_marker = '    setScLoading(false);\n  };'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

if start_idx == -1:
    print("ERROR: Could not find function!")
else:
    new_fn = """  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    setScLoading(true); setScResult(null);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
            { role: "system", content: "You are a medical AI for patients in India. Respond ONLY with valid JSON containing these exact fields: possibleConditions (array of 3 strings), recommendedSpecialist (string), urgency (low or medium or high), urgencyReason (string), generalAdvice (string of 3-4 sentences), homeRemedies (array of 3 strings), dietTips (array of 3 strings), restAdvice (string), medications (array of 2 strings), redFlags (array of 3 strings). No extra text." },
            { role: "user", content: "Age: " + (age||"unknown") + ", Gender: " + gender + ", Symptoms: " + symptoms }
          ]
        })
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const clean = text.replace(/^[^{]*/, "").replace(/[^}]*$/, "");
      if (clean.startsWith("{")) {
        const parsed = JSON.parse(clean);
        if (parsed.possibleConditions) { setScResult(parsed); }
        else { setScResult(getMockResult(symptoms)); }
      } else { setScResult(getMockResult(symptoms)); }
    } catch(e) { setScResult(getMockResult(symptoms)); }
    setScLoading(false);
  };"""

    new_content = content[:start_idx] + new_fn + content[end_idx:]
    with open('src/pages/HealthCenter.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    if 'openrouter' in new_content:
        print("SUCCESS! OpenRouter integrated!")
    else:
        print("ERROR!")
