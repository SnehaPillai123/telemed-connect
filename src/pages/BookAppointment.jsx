import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import PatientSidebar from "../components/PatientSidebar";
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

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 2);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", doctorId));
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchDoctor();
  }, [doctorId]);

  const validateDate = (val) => { if (!val) { setDateError("Please select a date"); return false; } if (val < today) { setDateError("Date cannot be in the past"); return false; } setDateError(""); return true; };
  const validateTime = (val) => { if (!val) { setTimeError("Please select a time slot"); return false; } setTimeError(""); return true; };
  const validateReason = (val) => { if (!val.trim()) { setReasonError("Please describe your reason for visit"); return false; } if (val.trim().length < 10) { setReasonError("Please provide more details (min 10 characters)"); return false; } setReasonError(""); return true; };

const handleBook = async (e) => {
  if (e) e.preventDefault();
  setShowPreview(false);
    const d = validateDate(selectedDate);
    const t = validateTime(selectedTime);
    const r = validateReason(reason);
    if (!d || !t || !r) return;
    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid, patientName: user.displayName,
        doctorId: doctor.id, doctorName: doctor.fullName,
        doctorSpecialization: doctor.specialization,
        appointmentDate: selectedDate, appointmentTime: selectedTime,
        reason: reason.trim(), status: "pending", createdAt: serverTimestamp()
      });
      toast.success("Appointment booked successfully!");
      navigate("/my-appointments");
    } catch { toast.error("Failed to book. Please try again."); }
    finally { setBooking(false); }
  };

  const formattedDate = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <PatientSidebar />
      <main style={{ marginLeft: 250, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );

  if (!doctor) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <PatientSidebar />
      <main style={{ marginLeft: 250, flex: 1, padding: '60px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Doctor not found.</p>
      </main>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .form-input.error { border-color: #ef4444; }
        .error-msg { font-size: 12px; color: #ef4444; margin-top: 4px; }
        .time-slot { padding: 9px 14px; border: 1.5px solid #e5e7eb; border-radius: 7px; font-size: 13px; font-weight: 500; color: #374151; background: white; cursor: pointer; transition: all 0.15s; text-align: center; font-family: Inter, sans-serif; }
        .time-slot:hover { border-color: #0d9488; color: #0d9488; background: #f0fdfa; }
        .time-slot.selected { border-color: #0d9488; background: #0d9488; color: white; }
        .book-btn { width: 100%; padding: 13px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: Inter, sans-serif; }
        .book-btn:hover { background: #0f766e; }
        .book-btn:disabled { background: #5eead4; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <PatientSidebar />
        <main style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column' }}>

          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 32px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 7, border: '1.5px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Consultation</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Book Appointment</h1>
            </div>
          </header>

          <div style={{ padding: '28px 32px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

              <form onSubmit={handleBook} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Doctor info */}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0d9488' }}>
                        {doctor.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Dr. {doctor.fullName}</p>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '3px 10px', borderRadius: 20, border: '1px solid #ccfbf1' }}>{doctor.specialization}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#0d9488' }}>₹{doctor.consultationFee}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>per consultation</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Select Date</p>
                  <input className={`form-input ${dateError ? 'error' : ''}`} type="date" min={today} max={maxDateStr} value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); validateDate(e.target.value); }}/>
                  {dateError && <p className="error-msg">{dateError}</p>}
                </div>

                {/* Time slots */}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Select Time Slot</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {TIME_SLOTS.map(slot => (
                      <button key={slot} type="button"
                        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => { setSelectedTime(slot); validateTime(slot); }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                  {timeError && <p className="error-msg" style={{ marginTop: 8 }}>{timeError}</p>}
                </div>

                {/* Reason */}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Reason for Visit</p>
                  <textarea className={`form-input ${reasonError ? 'error' : ''}`}
                    placeholder="Describe your symptoms or reason for this consultation..."
                    value={reason} onChange={e => { setReason(e.target.value); validateReason(e.target.value); }}
                    rows={4} style={{ resize: 'vertical' }}/>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{reason.length} characters · min 10</p>
                  {reasonError && <p className="error-msg">{reasonError}</p>}
                </div>

              <button className="book-btn" type="button" disabled={booking}
  onClick={(e) => {
    e.preventDefault();
    const d = validateDate(selectedDate);
    const t = validateTime(selectedTime);
    const r = validateReason(reason);
    if (d && t && r) setShowPreview(true);
  }}>
  Preview & Confirm
</button>
              </form>

              {/* Summary */}
              <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Booking Summary</p>
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Doctor', value: `Dr. ${doctor.fullName}` },
                      { label: 'Specialization', value: doctor.specialization },
                      { label: 'Date', value: formattedDate || 'Not selected' },
                      { label: 'Time', value: selectedTime || 'Not selected' },
                      { label: 'Fee', value: `₹${doctor.consultationFee}`, highlight: true },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: item.highlight ? '#0d9488' : '#111827', textAlign: 'right' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 20px', background: '#f0fdfa', borderTop: '1px solid #ccfbf1' }}>
                    <p style={{ fontSize: 12, color: '#0f766e', lineHeight: 1.6 }}>Appointment will be confirmed once the doctor accepts your request.</p>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Doctor Information</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Experience', value: `${doctor.experience || '—'} yrs` },
                      { label: 'Rating', value: doctor.rating || '4.5' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: '#f9fafb', borderRadius: 7, padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#0d9488', marginBottom: 2 }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
{showPreview && (
  <>
    <style>{`
      @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .preview-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px); }
      .preview-modal { background:white;border-radius:16px;width:100%;max-width:440px;overflow:hidden;animation:fadeInUp 0.3s ease; }
    `}</style>
    <div className="preview-overlay" onClick={() => setShowPreview(false)}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div style={{ background:'linear-gradient(135deg,#0d9488,#0284c7)', padding:'20px 24px' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.8)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Booking Preview</p>
          <p style={{ fontSize:18, fontWeight:800, color:'white' }}>Confirm Your Appointment</p>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:18, padding:'14px', background:'#f0fdfa', borderRadius:10, border:'1px solid #ccfbf1' }}>
            <div style={{ width:44,height:44,borderRadius:10,background:'#0d9488',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ fontSize:14,fontWeight:700,color:'white' }}>{doctor.fullName?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}</span>
            </div>
            <div>
              <p style={{ fontSize:15,fontWeight:700,color:'#111827',marginBottom:2 }}>Dr. {doctor.fullName}</p>
              <p style={{ fontSize:12,color:'#0d9488' }}>{doctor.specialization}</p>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
            {[
              { icon:'📅', label:'Date', value:new Date(selectedDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) },
              { icon:'🕐', label:'Time', value:selectedTime },
              { icon:'💰', label:'Consultation Fee', value:`₹${doctor.consultationFee}` },
              { icon:'📝', label:'Reason', value:reason },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex',gap:12,padding:'10px 14px',background:'#f9fafb',borderRadius:8 }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11,color:'#9ca3af',marginBottom:2 }}>{item.label}</p>
                  <p style={{ fontSize:13,fontWeight:600,color:'#111827' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#fffbeb',borderRadius:8,padding:'10px 14px',marginBottom:18,border:'1px solid #fde68a' }}>
            <p style={{ fontSize:12,color:'#92400e' }}>⚠️ Appointment will be confirmed once the doctor accepts your request.</p>
          </div>
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={() => setShowPreview(false)} style={{ flex:1,padding:'11px',background:'white',color:'#374151',border:'1.5px solid #e5e7eb',borderRadius:9,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'Inter,sans-serif' }}>
              Edit
            </button>
            <button onClick={handleBook} disabled={booking} style={{ flex:2,padding:'11px',background:'#0d9488',color:'white',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif' }}>
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
    </>
  );
}
