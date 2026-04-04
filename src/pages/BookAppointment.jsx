import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import PaymentGateway from "../components/PaymentGateway";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","02:00 PM",
  "02:30 PM","03:00 PM","03:30 PM","04:00 PM",
  "04:30 PM","05:00 PM"
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", doctorId));
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchDoctor();
  }, [doctorId]);

  const validateDate = (val) => {
    if (!val) { setDateError("Please select a date"); return false; }
    if (val < today) { setDateError("Date cannot be in the past"); return false; }
    setDateError(""); return true;
  };
  const validateTime = (val) => {
    if (!val) { setTimeError("Please select a time slot"); return false; }
    setTimeError(""); return true;
  };
  const validateReason = (val) => {
    if (!val.trim()) { setReasonError("Please describe your reason for visit"); return false; }
    if (val.trim().length < 10) { setReasonError("Please provide more details (min 10 characters)"); return false; }
    setReasonError(""); return true;
  };

  const handleBook = async (paymentId) => {
    setShowPayment(false);
    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid, patientName: user.displayName,
        doctorId: doctor.id, doctorName: doctor.fullName,
        doctorSpecialization: doctor.specialization,
        appointmentDate: selectedDate, appointmentTime: selectedTime,
        reason: reason.trim(), status: "pending",
        paymentId: paymentId || null,
        paymentStatus: paymentId ? "paid" : "free",
        createdAt: serverTimestamp()
      });
      setShowSuccess(true);
    } catch {
      toast.error("Failed to book. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      })
    : null;

  if (loading) return (
    <Layout title="Book Appointment" subtitle="Consultation">
      <div style={{ display:"flex", justifyContent:"center", padding:"80px 0" }}>
        <div style={{ width:32, height:32, border:"3px solid #e5e7eb", borderTopColor:"#0d9488", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  );

  if (!doctor) return (
    <Layout title="Book Appointment" subtitle="Consultation">
      <div style={{ textAlign:"center", padding:"80px 0" }}>
        <p style={{ color:"#6b7280" }}>Doctor not found.</p>
      </div>
    </Layout>
  );

  // ── Payment screen ──────────────────────────────────────────────────────────
  if (showPayment) return (
    <Layout title="Complete Payment" subtitle="Secure Checkout">
      <PaymentGateway
        doctor={doctor}
        patientName={user?.displayName}
        onSuccess={(paymentId) => handleBook(paymentId)}
        onCancel={() => setShowPayment(false)}
      />
    </Layout>
  );

  if (showSuccess) return (
    <Layout title="Booking Confirmed!" subtitle="Appointment">
      <style>{`
        @keyframes popIn { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .success-card { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .next-btn { width:100%; padding:13px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; transition:all 0.2s; border:none; }
        .next-btn-primary { background:#0d9488; color:white; }
        .next-btn-primary:hover { background:#0f766e; }
        .next-btn-secondary { background:white; color:#374151; border:1.5px solid #e5e7eb !important; }
        .next-btn-secondary:hover { border-color:#0d9488 !important; color:#0d9488; }
        .step-item { animation: fadeUp 0.4s ease forwards; }
      `}</style>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"10px 0" }}>
        <div className="success-card" style={{ background:"white", borderRadius:20, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 }}>
          <div style={{ background:"linear-gradient(135deg,#0d9488,#0284c7)", padding:"32px 24px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"3px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize:20, fontWeight:800, color:"white", marginBottom:6 }}>Appointment Booked!</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.85)" }}>Request sent to Dr. {doctor.fullName}</p>
          </div>
          <div style={{ padding:"20px" }}>
            <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, paddingBottom:12, borderBottom:"1px solid #e5e7eb" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#0d9488" }}>
                    {doctor.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
                  </span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#111827" }}>Dr. {doctor.fullName}</p>
                  <p style={{ fontSize:12, color:"#0d9488" }}>{doctor.specialization}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:"#d97706", background:"#fffbeb", padding:"3px 10px", borderRadius:20, border:"1px solid #fde68a", flexShrink:0 }}>Pending</span>
              </div>
              {[
                { icon:"📅", label:"Date", value:formattedDate },
                { icon:"🕐", label:"Time", value:selectedTime },
                { icon:"💰", label:"Fee", value:"₹"+doctor.consultationFee },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<2?"1px solid #f3f4f6":"none" }}>
                  <span style={{ fontSize:14, width:22 }}>{item.icon}</span>
                  <span style={{ fontSize:13, color:"#6b7280", flex:1 }}>{item.label}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fffbeb", borderRadius:10, padding:"10px 14px", marginBottom:16, border:"1px solid #fde68a", display:"flex", gap:8 }}>
              <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
              <p style={{ fontSize:12, color:"#92400e", lineHeight:1.6 }}>Doctor will review and confirm your request. Check your appointments for status updates.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button className="next-btn next-btn-primary" onClick={() => navigate("/my-appointments")}>📋 View My Appointments</button>
              <button className="next-btn next-btn-secondary" style={{ border:"1.5px solid #e5e7eb" }} onClick={() => navigate("/search-doctors")}>🔍 Book Another</button>
              <button className="next-btn next-btn-secondary" style={{ border:"1.5px solid #e5e7eb" }} onClick={() => navigate("/patient-dashboard")}>🏠 Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Book Appointment" subtitle="Consultation">
      <style>{`
        .form-input { width:100%; padding:11px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; color:#111827; background:white; outline:none; transition:all 0.2s; font-family:Inter,sans-serif; }
        .form-input:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }
        .form-input.error { border-color:#ef4444; }
        .error-msg { font-size:12px; color:#ef4444; margin-top:4px; }
        .time-slot { padding:9px 8px; border:1.5px solid #e5e7eb; border-radius:7px; font-size:12px; font-weight:500; color:#374151; background:white; cursor:pointer; transition:all 0.15s; text-align:center; font-family:Inter,sans-serif; }
        .time-slot:hover { border-color:#0d9488; color:#0d9488; background:#f0fdfa; }
        .time-slot.selected { border-color:#0d9488; background:#0d9488; color:white; }
        .book-btn { width:100%; padding:13px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:Inter,sans-serif; }
        .book-btn:hover { background:#0f766e; }
        .book-btn:disabled { background:#5eead4; cursor:not-allowed; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .preview-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px); }
        .preview-modal { background:white;border-radius:16px;width:100%;max-width:440px;overflow:hidden;animation:fadeInUp 0.3s ease;max-height:90vh;overflow-y:auto; }

        /* Book layout — stacked on mobile */
        .book-layout { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
        .book-sidebar { position:sticky; top:24px; display:flex; flex-direction:column; gap:14px; }

        /* Time slots grid */
        .slots-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }

        @media screen and (max-width:599px) {
          .book-layout { grid-template-columns:1fr !important; }
          .book-sidebar { position:static !important; }
          .slots-grid { grid-template-columns:repeat(3,1fr) !important; gap:6px !important; }
          .time-slot { font-size:11px !important; padding:8px 4px !important; }
        }
        @media screen and (min-width:600px) and (max-width:991px) {
          .book-layout { grid-template-columns:1fr !important; }
          .book-sidebar { position:static !important; }
        }
      `}</style>

      {showPreview && (
        <div className="preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg,#0d9488,#0284c7)", padding:"18px 20px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Review & Confirm</p>
              <p style={{ fontSize:17, fontWeight:800, color:"white" }}>Confirm Your Appointment</p>
            </div>
            <div style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16, padding:"12px", background:"#f0fdfa", borderRadius:10, border:"1px solid #ccfbf1" }}>
                <div style={{ width:40,height:40,borderRadius:10,background:"#0d9488",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"white" }}>
                    {doctor.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize:14,fontWeight:700,color:"#111827",marginBottom:2 }}>Dr. {doctor.fullName}</p>
                  <p style={{ fontSize:12,color:"#0d9488" }}>{doctor.specialization}</p>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
                {[
                  { icon:"📅", label:"Date", value:formattedDate },
                  { icon:"🕐", label:"Time", value:selectedTime },
                  { icon:"💰", label:"Fee", value:"₹"+doctor.consultationFee },
                  { icon:"📝", label:"Reason", value:reason },
                ].map((item,i) => (
                  <div key={i} style={{ display:"flex",gap:10,padding:"9px 12px",background:"#f9fafb",borderRadius:8 }}>
                    <span style={{ fontSize:15 }}>{item.icon}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:11,color:"#9ca3af",marginBottom:1 }}>{item.label}</p>
                      <p style={{ fontSize:13,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fffbeb",borderRadius:8,padding:"10px 12px",marginBottom:16,border:"1px solid #fde68a" }}>
                <p style={{ fontSize:12,color:"#92400e" }}>⚠️ Appointment is pending until doctor accepts.</p>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={() => setShowPreview(false)} style={{ flex:1,padding:"11px",background:"white",color:"#374151",border:"1.5px solid #e5e7eb",borderRadius:9,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  Edit
                </button>
                <button onClick={() => { setShowPreview(false); setShowPayment(true); }} disabled={booking} style={{ flex:2,padding:"11px",background:"#0d9488",color:"white",border:"none",borderRadius:9,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                  💳 Proceed to Pay ₹{doctor.consultationFee}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="book-layout">
        <form noValidate style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Doctor info */}
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"16px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ width:46, height:46, borderRadius:10, background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#0d9488" }}>
                  {doctor.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
                </span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:4 }}>Dr. {doctor.fullName}</p>
                <span style={{ fontSize:12, fontWeight:600, color:"#0d9488", background:"#f0fdfa", padding:"3px 10px", borderRadius:20, border:"1px solid #ccfbf1" }}>{doctor.specialization}</span>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ fontSize:18, fontWeight:700, color:"#0d9488" }}>₹{doctor.consultationFee}</p>
                <p style={{ fontSize:11, color:"#6b7280" }}>per consultation</p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"16px" }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:12 }}>Select Date</p>
            <input className={"form-input "+(dateError?"error":"")} type="date" min={today} max={maxDateStr} value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); validateDate(e.target.value); }}/>
            {dateError && <p className="error-msg">{dateError}</p>}
          </div>

          {/* Time slots */}
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"16px" }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:12 }}>Select Time Slot</p>
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button"
                  className={"time-slot "+(selectedTime===slot?"selected":"")}
                  onClick={() => { setSelectedTime(slot); validateTime(slot); }}>
                  {slot}
                </button>
              ))}
            </div>
            {timeError && <p className="error-msg" style={{ marginTop:8 }}>{timeError}</p>}
          </div>

          {/* Reason */}
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"16px" }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:12 }}>Reason for Visit</p>
            <textarea className={"form-input "+(reasonError?"error":"")}
              placeholder="Describe your symptoms or reason for this consultation..."
              value={reason} onChange={e => { setReason(e.target.value); validateReason(e.target.value); }}
              rows={4} style={{ resize:"vertical" }}/>
            <p style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{reason.length} characters · min 10</p>
            {reasonError && <p className="error-msg">{reasonError}</p>}
          </div>

          <button className="book-btn" type="button" disabled={booking}
            onClick={() => {
              const d = validateDate(selectedDate);
              const t = validateTime(selectedTime);
              const r = validateReason(reason);
              if (d && t && r) setShowPreview(true);
            }}>
            Preview & Confirm →
          </button>
        </form>

        {/* Summary sidebar */}
        <aside className="book-sidebar">
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #f3f4f6", background:"#f9fafb" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#111827" }}>Booking Summary</p>
            </div>
            <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:"Doctor", value:"Dr. "+doctor.fullName },
                { label:"Specialization", value:doctor.specialization },
                { label:"Date", value:formattedDate||"Not selected" },
                { label:"Time", value:selectedTime||"Not selected" },
                { label:"Fee", value:"₹"+doctor.consultationFee, highlight:true },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <p style={{ fontSize:13, color:"#6b7280" }}>{item.label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:item.highlight?"#0d9488":"#111827", textAlign:"right" }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 16px", background:"#f0fdfa", borderTop:"1px solid #ccfbf1" }}>
              <p style={{ fontSize:12, color:"#0f766e", lineHeight:1.6 }}>Appointment pending until doctor confirms.</p>
            </div>
          </div>
          <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"16px" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:12 }}>Doctor Info</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Experience", value:(doctor.experience||"—")+" yrs" },
                { label:"Rating", value:doctor.rating||"4.5" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#f9fafb", borderRadius:7, padding:"10px", textAlign:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700, color:"#0d9488", marginBottom:2 }}>{s.value}</p>
                  <p style={{ fontSize:11, color:"#6b7280" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
