import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

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
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Fetch appointment details
  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "appointments", appointmentId));
        if (snap.exists()) {
          setAppointment({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Appointment not found.");
          navigate(-1);
        }
      } catch {
        toast.error("Failed to load appointment.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [appointmentId]);

  // Load Jitsi script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Start the call
  const startCall = () => {
    if (!window.JitsiMeetExternalAPI) {
      toast.error("Video library not loaded. Please refresh the page.");
      return;
    }

    const roomName = `TeleMedConnect-${appointmentId}`;
    const displayName = role === "doctor"
      ? `Dr. ${user.displayName || "Doctor"}`
      : (user.displayName || "Patient");

    const options = {
      roomName,
      width: "100%",
      height: "100%",
      parentNode: jitsiRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        toolbarButtons: [
          "microphone", "camera", "closedcaptions",
          "desktop", "fullscreen", "hangup",
          "chat", "raisehand", "tileview",
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: "#0f172a",
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      userInfo: { displayName },
    };

    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", options);

    apiRef.current.addEventListener("videoConferenceJoined", () => {
      setCallStarted(true);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    });

    apiRef.current.addEventListener("readyToClose", () => {
      handleEndCall();
    });
  };

  const handleEndCall = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    clearInterval(timerRef.current);
    setCallEnded(true);
    setCallStarted(false);
  };

  useEffect(() => {
    return () => {
      if (apiRef.current) apiRef.current.dispose();
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) return (
    <Layout>
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#6b7280", marginTop: 12 }}>Loading appointment…</p>
      </div>
    </Layout>
  );

  // ── Call ended screen ──────────────────────────────────────────────────────
  if (callEnded) return (
    <Layout>
      <div style={styles.center}>
        <div style={styles.endCard}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: "#0d9488", marginBottom: 6 }}>Call Ended</h2>
          <p style={{ color: "#6b7280", marginBottom: 4 }}>
            Duration: <strong>{formatTime(elapsed)}</strong>
          </p>
          <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
            Consultation with {role === "doctor" ? appointment?.patientName : `Dr. ${appointment?.doctorName}`}
          </p>
          <button
            onClick={() => navigate(role === "doctor" ? "/doctor-appointments" : "/my-appointments")}
            style={styles.backBtn}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={styles.page}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.liveDot} />
            <div>
              <div style={styles.headerTitle}>
                Video Consultation
              </div>
              <div style={styles.headerSub}>
                {role === "doctor"
                  ? `Patient: ${appointment?.patientName}`
                  : `Dr. ${appointment?.doctorName} · ${appointment?.doctorSpecialization}`}
              </div>
            </div>
          </div>
          <div style={styles.headerRight}>
            {callStarted && (
              <span style={styles.timer}>⏱ {formatTime(elapsed)}</span>
            )}
            {callStarted && (
              <button onClick={handleEndCall} style={styles.endBtn}>
                📵 End Call
              </button>
            )}
          </div>
        </div>

        {/* ── Pre-call panel OR Jitsi frame ── */}
        {!callStarted ? (
          <div style={styles.preCall}>
            <div style={styles.preCallCard}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎥</div>
              <h2 style={styles.preCallTitle}>Ready to Join?</h2>
              <p style={styles.preCallSub}>
                You'll join a private, secure video room for this consultation.
                Make sure your camera and microphone are allowed in the browser.
              </p>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>📅</span>
                  <div>
                    <div style={styles.infoLabel}>Date</div>
                    <div style={styles.infoValue}>{appointment?.appointmentDate}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>🕐</span>
                  <div>
                    <div style={styles.infoLabel}>Time</div>
                    <div style={styles.infoValue}>{appointment?.appointmentTime}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>👤</span>
                  <div>
                    <div style={styles.infoLabel}>
                      {role === "doctor" ? "Patient" : "Doctor"}
                    </div>
                    <div style={styles.infoValue}>
                      {role === "doctor"
                        ? appointment?.patientName
                        : `Dr. ${appointment?.doctorName}`}
                    </div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>💬</span>
                  <div>
                    <div style={styles.infoLabel}>Reason</div>
                    <div style={styles.infoValue} title={appointment?.reason}>
                      {appointment?.reason?.slice(0, 30)}{appointment?.reason?.length > 30 ? "…" : ""}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.tips}>
                <div style={styles.tipRow}>✅ Find a quiet, well-lit space</div>
                <div style={styles.tipRow}>✅ Allow camera & microphone when prompted</div>
                <div style={styles.tipRow}>✅ Use headphones for better audio</div>
              </div>

              <button onClick={startCall} style={styles.joinBtn}>
                🎥 Join Video Call
              </button>
              <button onClick={() => navigate(-1)} style={styles.backLinkBtn}>
                ← Back to Appointments
              </button>
            </div>
          </div>
        ) : (
          /* ── Jitsi iframe container ── */
          <div style={styles.jitsiContainer}>
            <div ref={jitsiRef} style={styles.jitsiFrame} />
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Layout>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  page: { display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 },
  spinner: { width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#0d9488", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  // Header
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#fff", borderBottom: "1px solid #e5e7eb",
    padding: "12px 24px", flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  liveDot: {
    width: 10, height: 10, borderRadius: "50%", background: "#22c55e",
    animation: "pulse 1.5s infinite", flexShrink: 0,
  },
  headerTitle: { fontWeight: 700, fontSize: 16, color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  timer: { fontFamily: "monospace", fontSize: 16, color: "#0d9488", fontWeight: 700 },
  endBtn: {
    padding: "8px 18px", background: "#dc2626", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14,
  },

  // Pre-call
  preCall: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "#f9fafb" },
  preCallCard: {
    background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "40px 36px", maxWidth: 520, width: "100%", textAlign: "center",
  },
  preCallTitle: { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 },
  preCallSub: { color: "#6b7280", fontSize: 14, marginBottom: 24, lineHeight: 1.6 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, textAlign: "left" },
  infoItem: {
    background: "#f0fdfa", border: "1px solid #99f6e4",
    borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10,
  },
  infoIcon: { fontSize: 18, marginTop: 2 },
  infoLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  infoValue: { fontSize: 13, color: "#111827", fontWeight: 600 },
  tips: {
    background: "#f9fafb", borderRadius: 10, padding: "12px 16px",
    marginBottom: 24, textAlign: "left",
  },
  tipRow: { fontSize: 13, color: "#374151", marginBottom: 4 },
  joinBtn: {
    width: "100%", padding: "14px 0",
    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10,
  },
  backLinkBtn: {
    width: "100%", padding: "10px 0", background: "transparent",
    color: "#6b7280", border: "1px solid #e5e7eb",
    borderRadius: 10, fontSize: 14, cursor: "pointer",
  },

  // Jitsi frame
  jitsiContainer: { flex: 1, background: "#0f172a", padding: 0 },
  jitsiFrame: { width: "100%", height: "100%" },

  // End card
  endCard: {
    background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "48px 36px", maxWidth: 400, width: "100%", textAlign: "center",
  },
  backBtn: {
    padding: "12px 28px", background: "#0d9488", color: "#fff",
    border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 15,
  },
};
