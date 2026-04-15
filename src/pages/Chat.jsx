import { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, or } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const LANGS = [
  { code:"en", label:"English" },
  { code:"hi", label:"Hindi" },
  { code:"mr", label:"Marathi" },
  { code:"ta", label:"Tamil" },
  { code:"te", label:"Telugu" },
];

export default function Chat() {
  const { user } = useAuth();
  const { doctorId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState("Doctor");
  const bottomRef = useRef(null);

  const chatId = [user.uid, doctorId].sort().join("_");

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const translateText = async (txt, targetLang) => {
    if (targetLang === "en") return txt;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt)}&langpair=en|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData?.translatedText || txt;
    } catch { return txt; }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    const originalText = text.trim();
    setText("");
    try {
      const translatedText = lang !== "en" ? await translateText(originalText, lang) : originalText;
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName,
        originalText,
        translatedText,
        language: lang,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      toast.error("Failed to send message");
      setText(originalText);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <Layout title="Chat" subtitle="Consultation">
      <style>{`
        .chat-wrap { display:flex; flex-direction:column; height:calc(100vh - 140px); min-height:400px; background:white; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; }
        .chat-header { padding:14px 18px; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; gap:12px; background:#f9fafb; flex-shrink:0; }
        .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:#fafafa; }
        .msg-row { display:flex; gap:8px; align-items:flex-end; }
        .msg-row.mine { flex-direction:row-reverse; }
        .msg-avatar { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; }
        .msg-bubble { max-width:65%; padding:10px 14px; border-radius:12px; word-break:break-word; }
        .msg-bubble.theirs { background:white; border:1px solid #e5e7eb; border-bottom-left-radius:3px; }
        .msg-bubble.mine { background:#0d9488; color:white; border-bottom-right-radius:3px; }
        .msg-original { font-size:13px; line-height:1.5; }
        .msg-translated { font-size:11px; margin-top:4px; opacity:0.75; font-style:italic; }
        .msg-time { font-size:10px; color:#9ca3af; margin-top:3px; text-align:right; }
        .msg-time.mine { text-align:left; color:rgba(255,255,255,0.7); }
        .chat-footer { padding:12px 16px; border-top:1px solid #f3f4f6; background:white; flex-shrink:0; }
        .chat-input-row { display:flex; gap:8px; align-items:flex-end; }
        .chat-textarea { flex:1; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:10px; font-size:14px; font-family:Inter,sans-serif; resize:none; outline:none; max-height:100px; overflow-y:auto; }
        .chat-textarea:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
        .send-btn { width:40px; height:40px; border-radius:10px; background:#0d9488; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.15s; }
        .send-btn:hover { background:#0f766e; }
        .send-btn:disabled { background:#5eead4; cursor:not-allowed; }
        .lang-select { padding:7px 10px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:12px; font-family:Inter,sans-serif; outline:none; background:white; color:#374151; }
        .lang-select:focus { border-color:#0d9488; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .msg-row { animation: fadeIn 0.2s ease; }
      `}</style>

      <div className="chat-wrap">
        {/* Header */}
        <div className="chat-header">
          <div style={{ width:36, height:36, borderRadius:"50%", background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827" }}>Consultation Chat</p>
            <p style={{ fontSize:11, color:"#6b7280" }}>Messages are translated in real-time</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ width:52, height:52, borderRadius:13, background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"#374151", marginBottom:4 }}>Start the conversation</p>
              <p style={{ fontSize:12, color:"#9ca3af" }}>Messages are translated automatically in your selected language.</p>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.senderId === user.uid;
            const initials = (msg.senderName || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
            const showTranslation = lang !== "en" && msg.translatedText && msg.translatedText !== msg.originalText;
            return (
              <div key={msg.id} className={`msg-row ${isMine ? "mine" : ""}`}>
                <div className="msg-avatar" style={{ background: isMine ? "#0d9488" : "#f0fdfa", border: isMine ? "none" : "1px solid #ccfbf1" }}>
                  <span style={{ color: isMine ? "white" : "#0d9488" }}>{initials}</span>
                </div>
                <div>
                  {!isMine && <p style={{ fontSize:11, color:"#9ca3af", marginBottom:3, paddingLeft:2 }}>{msg.senderName}</p>}
                  <div className={`msg-bubble ${isMine ? "mine" : "theirs"}`}>
                    <p className="msg-original">{isMine ? msg.originalText : (showTranslation ? msg.translatedText : msg.originalText)}</p>
                    {showTranslation && isMine && <p className="msg-translated">{msg.translatedText}</p>}
                  </div>
                  <p className={`msg-time ${isMine ? "mine" : ""}`}>
                    {msg.timestamp?.toDate?.()?.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) || ""}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <div className="chat-input-row">
            <textarea
              className="chat-textarea"
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={sending || !text.trim()}>
              {sending
                ? <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              }
            </button>
          </div>
          <p style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
