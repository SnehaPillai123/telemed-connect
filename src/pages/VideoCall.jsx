import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function VideoCall() {
  const { appointmentId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const jitsiRef = useRef(null);
  const apiRef = useRef(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchApt = async () => {
      const snap = await getDoc(doc(db, "appointments", appointmentId));
      if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchApt();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointment || callStarted) return;

    // Load Jitsi script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (apiRef.current) apiRef.current.dispose();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appointment]);

  const initJitsi = () => {
    if (!window.JitsiMeetExternalAPI || !jitsiRef.current) return;

    const roomName = "TeleMedConnect-" + appointmentId.slice(0, 10);
    const displayName = role === "doctor"
      ? "Dr. " + user.displayName
      : user.displayName;

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: jitsiRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName, email: user.email },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        toolbarButtons: [
          "microphone","camera","hangup","chat",
          "raisehand","tileview","fullscreen","settings"
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        MOBILE_APP_PROMO: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        HIDE_INVITE_MORE_HEADER: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        BRAND_WATERMARK_LINK: "",
        DEFAULT_LOGO_URL: "",
        JITSI_WATERMARK_LINK: "",
      },
    });

    apiRef.current = api;
    setCallStarted(true);

    // Start timer
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

    api.addEventListener("videoConferenceLeft", () => {
      setCallEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    api.addEventListener("readyToClose", () => {
      setCallEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);
    });
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return m + ":" + s;
  };

  const handleEndCall = () => {
    if (apiRef.current) apiRef.current.executeCommand("hangup");
    setCallEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goBack = () => {
    if (role === "doctor") navigate("/doctor-appointments");
    else navigate("/my-appointments");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid #334155", borderTopColor:"#0d9488", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#94a3b8", fontSize:14 }}>Connecting to video call...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (callEnded) return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#1e293b", borderRadius:20, padding:"40px 32px", textAlign:"center", maxWidth:400, width:"100%", border:"1px solid #334155" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(13,148,136,0.2)", border:"2px solid #0d9488", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:8 }}>Call Ended</h2>
        <p style={{ fontSize:14, color:"#94a3b8", marginBottom:6 }}>
          {appointment?.patientName || appointment?.doctorName}
        </p>
        <div style={{ background:"#0d9488", borderRadius:10, padding:"12px 20px", margin:"20px 0", display:"inline-block" }}>
          <p style={{ fontSize:28, fontWeight:800, color:"white", fontFamily:"monospace" }}>{formatDuration(duration)}</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Call Duration</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
          <button onClick={goBack}
            style={{ padding:"12px", background:"#0d9488", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
            Back to Appointments
          </button>
          {role === "doctor" && (
            <button onClick={() => navigate("/prescription/"+appointmentId)}
              style={{ padding:"12px", background:"#1e3a5f", color:"#60a5fa", border:"1px solid #1d4ed8", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              Write Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:7, background:"#0d9488", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"white" }}>
              {role === "doctor" ? "Consultation with " + appointment?.patientName : "Consultation with Dr. " + appointment?.doctorName}
            </p>
            <p style={{ fontSize:11, color:"#94a3b8" }}>
              {appointment?.doctorSpecialization} · {appointment?.appointmentDate}
            </p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {callStarted && (
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(239,68,68,0.15)", padding:"5px 12px", borderRadius:20, border:"1px solid rgba(239,68,68,0.3)" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", animation:"pulse 1.5s infinite" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#f87171", fontFamily:"monospace" }}>{formatDuration(duration)}</span>
            </div>
          )}
          <button onClick={handleEndCall}
            style={{ padding:"8px 16px", background:"#ef4444", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            End Call
          </button>
        </div>
      </div>

      {/* Jitsi iframe container */}
      <div ref={jitsiRef} style={{ flex:1, width:"100%", minHeight:0 }}/>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { font-family: Inter, sans-serif; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
