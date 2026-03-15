import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
  "04:30 PM", "05:00 PM"
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
  const [reasonError, setReasonError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

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

  // Real-time validation — Experiment 4
  const validateDate = (val) => {
    if (!val) { setDateError("Please select a date"); return false; }
    if (val < today) { setDateError("Date cannot be in the past"); return false; }
    setDateError("");
    return true;
  };

  const validateTime = (val) => {
    if (!val) { setTimeError("Please select a time slot"); return false; }
    setTimeError("");
    return true;
  };

  const validateReason = (val) => {
    if (!val.trim()) { setReasonError("Please describe your reason for visit"); return false; }
    if (val.trim().length < 10) { setReasonError("Please provide more details (min 10 characters)"); return false; }
    setReasonError("");
    return true;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const d = validateDate(selectedDate);
    const t = validateTime(selectedTime);
    const r = validateReason(reason);
    if (!d || !t || !r) return;

    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        patientName: user.displayName,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        doctorSpecialization: doctor.specialization,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: reason.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Appointment booked successfully!");
      navigate("/my-appointments");
    } catch {
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" aria-label="Loading doctor information"></div>
      </main>
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main style={{ padding: '60px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Doctor not found.</p>
      </main>
    </div>
  );

  const formattedDate = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .time-slot { padding: 9px 14px; border: 1.5px solid #e5e7eb; border-radius: 7px; font-size: 13px; font-weight: 500; color: #374151; background: white; cursor: pointer; transition: all 0.15s; text-align: center; }
        .time-slot:hover { border-color: #0d9488; color: #0d9488; background: #f0fdfa; }
        .time-slot.selected { border-color: #0d9488; background: #0d9488; color: white; }
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; outline: none; transition: all 0.2s; font-family: Inter, sans-serif; }
        .form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .form-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .error-msg { font-size: 12px; color: #ef4444; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
        .book-btn { width: 100%; padding: 13px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: Inter, sans-serif; }
        .book-btn:hover { background: #0f766e; }
        .book-btn:disabled { background: #5eead4; cursor: not-allowed; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navbar />

        {/* Semantic main tag */}
        <main>
          {/* Page header */}
          <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 40px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{ width: 34, height: 34, borderRadius: 7, border: '1.5px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Consultation</p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Book Appointment</h1>
              </div>
            </div>
          </header>

          <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

              {/* Booking Form — uses semantic form tag */}
              <section aria-label="Appointment booking form">
                <form onSubmit={handleBook} noValidate>

                  {/* Doctor info card */}
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f0fdfa', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#0d9488' }}>
                          {doctor.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Dr. {doctor.fullName}</p>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '3px 10px', borderRadius: 20, border: '1px solid #ccfbf1' }}>
                          {doctor.specialization}
                        </span>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#0d9488' }}>₹{doctor.consultationFee}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>per consultation</p>
                      </div>
                    </div>
                  </div>

                  {/* Date selection */}
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px', marginBottom: 16 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Select Date</p>
                    <div>
                      <label htmlFor="appointment-date" className="sr-only">Appointment date</label>
                      <input
                        id="appointment-date"
                        className={`form-input ${dateError ? 'error' : ''}`}
                        type="date"
                        min={today}
                        max={maxDateStr}
                        value={selectedDate}
                        onChange={e => { setSelectedDate(e.target.value); validateDate(e.target.value); }}
                        aria-required="true"
                        aria-describedby={dateError ? "date-error" : undefined}
                      />
                      {dateError && <p id="date-error" className="error-msg" role="alert">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 8v4M12 16h.01M22 12A10 10 0 112 12a10 10 0 0120 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        {dateError}
                      </p>}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px', marginBottom: 16 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Select Time Slot</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }} role="group" aria-label="Available time slots">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                          onClick={() => { setSelectedTime(slot); validateTime(slot); }}
                          aria-pressed={selectedTime === slot}
                          aria-label={`Select ${slot}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                    {timeError && <p className="error-msg" role="alert" style={{ marginTop: 8 }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 8v4M12 16h.01M22 12A10 10 0 112 12a10 10 0 0120 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {timeError}
                    </p>}
                  </div>

                  {/* Reason */}
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px', marginBottom: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Reason for Visit</p>
                    <div>
                      <label htmlFor="reason" className="sr-only">Reason for visit</label>
                      <textarea
                        id="reason"
                        className={`form-input ${reasonError ? 'error' : ''}`}
                        placeholder="Describe your symptoms or reason for this consultation..."
                        value={reason}
                        onChange={e => { setReason(e.target.value); validateReason(e.target.value); }}
                        rows={4}
                        style={{ resize: 'vertical' }}
                        aria-required="true"
                        aria-describedby={reasonError ? "reason-error" : "reason-hint"}
                      />
                      <p id="reason-hint" style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                        Minimum 10 characters · {reason.length} typed
                      </p>
                      {reasonError && <p id="reason-error" className="error-msg" role="alert">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 8v4M12 16h.01M22 12A10 10 0 112 12a10 10 0 0120 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        {reasonError}
                      </p>}
                    </div>
                  </div>

                  <button className="book-btn" type="submit" disabled={booking} aria-busy={booking}>
                    {booking ? "Booking appointment..." : "Confirm Appointment"}
                  </button>
                </form>
              </section>

              {/* Booking summary */}
              <aside aria-label="Booking summary">
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', position: 'sticky', top: 80 }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Booking Summary</p>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { label: 'Doctor', value: `Dr. ${doctor.fullName}` },
                        { label: 'Specialization', value: doctor.specialization },
                        { label: 'Date', value: formattedDate || 'Not selected' },
                        { label: 'Time', value: selectedTime || 'Not selected' },
                        { label: 'Consultation Fee', value: `₹${doctor.consultationFee}`, highlight: true },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <p style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{item.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: item.highlight ? '#0d9488' : '#111827', textAlign: 'right' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 20, padding: '14px', background: '#f0fdfa', borderRadius: 8, border: '1px solid #ccfbf1' }}>
                      <p style={{ fontSize: 12, color: '#0f766e', lineHeight: 1.6 }}>
                        Your appointment will be confirmed once the doctor accepts your request. You will be notified of the status.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor stats */}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px', marginTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Doctor Information</p>
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
    </>
  );
}
