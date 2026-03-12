import { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, or } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

const LANGUAGES = { English: "en", Hindi: "hi", Marathi: "mr", Tamil: "ta", Telugu: "te", Kannada: "kn", Bengali: "bn", Gujarati: "gu" };

const MOCK_TRANSLATIONS = {
  hi: { "Hello": "नमस्ते", "How are you?": "आप कैसे हैं?", "I have a headache": "मुझे सिरदर्द है", "Thank you": "धन्यवाद", "Please take rest": "कृपया आराम करें" },
  mr: { "Hello": "नमस्कार", "How are you?": "तुम्ही कसे आहात?", "I have a headache": "मला डोकेदुखी आहे", "Thank you": "धन्यवाद", "Please take rest": "कृपया विश्रांती घ्या" },
  ta: { "Hello": "வணக்கம்", "How are you?": "நீங்கள் எப்படி இருக்கிறீர்கள்?", "Thank you": "நன்றி" },
  te: { "Hello": "నమస్కారం", "How are you?": "మీరు ఎలా ఉన్నారు?", "Thank you": "ధన్యవాదాలు" },
};

async function translateText(text, targetLang) {
  if (targetLang === "en") return text;
  const mockLang = MOCK_TRANSLATIONS[targetLang];
  if (mockLang && mockLang[text]) return mockLang[text];
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
  } catch {}
  return text;
}

export default function Chat() {
  const { otherId } = useParams();
  const { user, role } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [myLang, setMyLang] = useState("English");
  const [otherLang, setOtherLang] = useState("Hindi");
  const bottomRef = useRef(null);

  const chatId = [user.uid, otherId].sort().join("_");

  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const targetLangCode = LANGUAGES[otherLang] || "en";
      const translated = await translateText(text, targetLangCode);
      await addDoc(collection(db, "chats"), {
        chatId,
        senderId: user.uid,
        senderName: user.displayName,
        originalText: text,
        translatedText: translated,
        originalLanguage: myLang,
        targetLanguage: otherLang,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .msg-bubble { max-width: 68%; padding: 12px 16px; border-radius: 16px; position: relative; }
        .msg-mine { background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border-bottom-right-radius: 4px; margin-left: auto; }
        .msg-other { background: white; color: #0f172a; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .input-field { width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: white; outline: none; transition: all 0.2s; resize: none; }
        .input-field:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .send-btn { padding: 13px 24px; background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .send-btn:hover { opacity: 0.92; }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        select.lang-select { padding: 7px 12px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.1); color: white; font-size: 13px; outline: none; cursor: pointer; }
        select.lang-select option { background: #0f172a; color: white; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Chat Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)', padding: '20px 48px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Consultation Chat</p>
              <h2 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 24, fontWeight: 400 }}>Multilingual Messaging</h2>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>My language</p>
                <select className="lang-select" value={myLang} onChange={e => setMyLang(e.target.value)}>
                  {Object.keys(LANGUAGES).map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ color: '#64748b', fontSize: 18 }}>→</div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Translate to</p>
                <select className="lang-select" value={otherLang} onChange={e => setOtherLang(e.target.value)}>
                  {Object.keys(LANGUAGES).map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 48px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', minHeight: 0 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Start the conversation</p>
              <p style={{ fontSize: 14 }}>Messages will be automatically translated for the other person</p>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.senderId === user.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
                  {msg.senderName}
                </p>
                <div className={`msg-bubble ${isMine ? 'msg-mine' : 'msg-other'}`}>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.originalText}</p>
                  {msg.translatedText && msg.translatedText !== msg.originalText && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: isMine ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>
                        Translated to {msg.targetLanguage}:
                      </p>
                      <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>{msg.translatedText}</p>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  {msg.timestamp?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Input Area */}
        <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '16px 48px', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea className="input-field" rows={1} placeholder="Type a message... (Enter to send)"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              style={{ flex: 1 }}/>
            <button className="send-btn" onClick={sendMessage} disabled={sending || !input.trim()}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          <p style={{ maxWidth: 900, margin: '8px auto 0', fontSize: 12, color: '#94a3b8' }}>
            Your message will be automatically translated from {myLang} to {otherLang}
          </p>
        </div>
      </div>
    </>
  );
}
