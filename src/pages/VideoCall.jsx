import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VideoCall() {
  const { appointmentId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "appointments", appointmentId));
        if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() });
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [appointmentId]);

  const roomName = "TeleMedConnect-" + (appointmentId || "").slice(0, 12);
  const jitsiURL = `https://meet.jit.si/${roomName}`;

  const joinCall = () => {
    setJoined(true);
    window.open(jitsiURL, "_blank", "noopener,noreferrer");
  };

  const goBack = () => {
    if (role === "doctor") navigate("/doctor-appointments");
    else navigate("/my-appointments");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a" }}>
      <div style={{ width:32, height:32, border:"3px solid #334155", borderTopColor:"#0d9488", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .vc-card{animation:fadeUp 0.4s ease}`}</style>

      <div className="vc-card" style={{ background:"#1e293b", borderRadius:20, padding:"40px 32px", maxWidth:480, width:"100%", border:"1px solid #334155", textAlign:"center" }}>
        {/* Header */}
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(13,148,136,0.2)", border:"2px solid #0d9488", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={{ fontSize:22, fontWeight:800, color:"white", marginBottom:8 }}>
          {joined ? "Call Opened in New Tab" : "Video Consultation"}
        </h1>

        {appointment && (
          <p style={{ fontSize:14, color:"#94a3b8", marginBottom:20 }}>
            {role==="doctor" ? "Patient: "+appointment.patientName : "Dr. "+appointment.doctorName+" · "+appointment.doctorSpecialization}
          </p>
        )}

        {/* Room info */}
        <div style={{ background:"#0f172a", borderRadius:12, padding:"14px 18px", marginBottom:24, border:"1px solid #334155" }}>
          <p style={{ fontSize:11, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Private Room</p>
          <p style={{ fontSize:14, fontWeight:600, color:"#0d9488", fontFamily:"monospace" }}>{roomName}</p>
          <p style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Both doctor and patient join this same room automatically</p>
        </div>

        {!joined ? (
          <>
            <div style={{ background:"#1e3a5f", borderRadius:10, padding:"12px 16px", marginBottom:20, border:"1px solid #1d4ed8", textAlign:"left" }}>
              <p style={{ fontSize:13, color:"#93c5fd", lineHeight:1.6 }}>
                Clicking Join will open <strong>Jitsi Meet</strong> in a new tab. Both doctor and patient click this button from their appointments to join the same private room.
              </p>
            </div>
            <button onClick={joinCall}
              style={{ width:"100%", padding:"14px", background:"#0d9488", color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"Inter,sans-serif", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Join Video Call (Jitsi Meet)
            </button>
          </>
        ) : (
          <>
            <div style={{ background:"rgba(13,148,136,0.15)", borderRadius:10, padding:"14px 16px", marginBottom:20, border:"1px solid rgba(13,148,136,0.3)" }}>
              <p style={{ fontSize:14, color:"#5eead4", fontWeight:600, marginBottom:4 }}>Jitsi Meet opened in new tab</p>
              <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>If the tab didn't open, your browser may have blocked the popup. Click "Open Again" below.</p>
            </div>
            <button onClick={joinCall}
              style={{ width:"100%", padding:"12px", background:"#1e293b", color:"#0d9488", border:"1.5px solid #0d9488", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
              Open Again ↗
            </button>
          </>
        )}

        <button onClick={goBack}
          style={{ width:"100%", padding:"11px", background:"transparent", color:"#64748b", border:"1px solid #334155", borderRadius:12, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
          ← Back to Appointments
        </button>

        {role==="doctor" && joined && (
          <button onClick={() => navigate("/prescription/"+appointmentId)}
            style={{ width:"100%", padding:"11px", background:"#1e3a5f", color:"#60a5fa", border:"1px solid #1d4ed8", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif", marginTop:10 }}>
            Write Prescription After Call
          </button>
        )}
      </div>
    </div>
  );
}
