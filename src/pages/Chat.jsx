import { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, or } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import PatientSidebar from "../components/PatientSidebar";
import { useParams } from "react-router-dom";

const MOCK_TRANSLATIONS = {
  hi: { "hello": "नमस्ते", "how are you": "आप कैसे हैं", "thank you": "धन्यवाद", "good morning": "सुप्रभात", "pain": "दर्द", "fever": "बुखार", "medicine": "दवा" },
  mr: { "hello": "नमस्कार", "how are you": "तुम्ही कसे आहात", "thank you": "धन्यवाद", "good morning": "सुप्रभात", "pain": "वेदना", "fever": "ताप", "medicine": "औषध" },
  ta: { "hello": "வணக்கம்", "how are you": "நீங்கள் எப்படி இருக்கிறீர்கள்", "thank you": "நன்றி", "pain": "வலி", "fever": "காய்ச்சல்", "medicine": "மருந்து" },
  te: { "hello": "నమస్కారం", "how are you": "మీరు ఎలా ఉన్నారు", "thank you": "ధన్యవాదాలు", "pain": "నొప్పి", "fever": "జ్వరం", "medicine": "మందు" },
};

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" }, { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
];

async function translateText(text, targetLang) {
  if (targetLang === "en") return text;
  const mockDict = MOCK_TRANSLATIONS[targetLang];
  if (mockDict) {
    const lower = text.toLowerCase();
    for (const [key, val] of Object.entries(mockDict)) {
      if (lower.includes(key)) return val + " (" + text + ")";
    }
  }
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch { return text; }
}

export default function Chat() {
  const { otherId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [myLang, setMyLang] = useState("en");
  const [otherLang, setOtherLang] = useState("en");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !otherId) return;
    const q = query(
      collection(db, "chats"),
      or(
        where("senderId", "==", user.uid),
        where("receiverId", "==", user.uid)
      ),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(m => (m.senderId === user.uid && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === user.uid));
      setMessages(msgs);
    });
    return unsub;
  }, [user, otherId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const translated = await translateText(newMessage, otherLang);
      await addDoc(collection(db, "chats"), {
        senderId: user.uid, receiverId: otherId,
        originalText: newMessage, translatedText: translated,
        originalLanguage: myLang, timestamp: serverTimestamp(), read: false
      });
      setNewMessage("");
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .message-bubble { max-width: 70%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
        .my-bubble { background: #0d9488; color: white; border-bottom-right-radius: 4px; margin-left: auto; }
        .other-bubble { background: white; color: #111827; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; }
        .lang-select { padding: 6px 10px; border: 1.5px solid #e5e7eb; border-radius: 7px; font-size: 12px; color: #374151; background: white; outline: none; cursor: pointer; font-family: Inter, sans-serif; }
        .lang-select:focus { border-color: #0d9488; }
        .send-btn { padding: 10px 20px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: Inter, sans-serif; flex-shrink: 0; }
        .send-btn:hover { background: #0f766e; }
        .send-btn:disabled { background: #5eead4; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <PatientSidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>

          {/* Header */}
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Multilingual Chat</p>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Consultation Chat</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>My language:</span>
                <select className="lang-select" value={myLang} onChange={e => setMyLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Translate to:</span>
                <select className="lang-select" value={otherLang} onChange={e => setOtherLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f9fafb' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No messages yet</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Start the conversation below</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user.uid;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div className={`message-bubble ${isMe ? 'my-bubble' : 'other-bubble'}`}>
                    <p>{msg.originalText}</p>
                    {msg.translatedText && msg.translatedText !== msg.originalText && (
                      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 4, fontStyle: 'italic' }}>({msg.translatedText})</p>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    {msg.timestamp?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input */}
          <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
            <textarea
              value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send)"
              rows={2}
              style={{ flex: 1, padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
              onFocus={e => e.target.style.borderColor='#0d9488'}
              onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
            <button className="send-btn" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
              {sending ? "..." : "Send"}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}