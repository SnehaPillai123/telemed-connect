import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const TIMES = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

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

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "doctors", doctorId));
      if (snap.exists()) setDoctor({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [doctorId]);

  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isAvailable = (dateStr) => {
    if (!doctor?.availability) return true;
    const day = getDayName(dateStr);
    return doctor.availability[day] !== false;
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return toast.error("Please select a date and time");
    if (!isAvailable(selectedDate)) return toast.error("Doctor is not available on this day");
    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        patientName: user.displayName,
        doctorId: doctorId,
        doctorName: doctor.fullName,
        doctorSpecialization: doctor.specialization,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: reason,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Appointment booked successfully!");
      navigate("/patient-dashboard");
    } catch (err) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .time-chip { padding: 10px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: white; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; color: #374151; }
        .time-chip:hover { border-color: #0d9488; color: #0d9488; }
        .time-chip.selected { background: #0d9488; border-color: #0d9488; color: white; }
        .time-chip.disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
        .input-field { width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #0d9488; background: white; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .primary-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #0d9488, #0284c7); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .primary-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.3); }
        .primary-btn:disabled { opacity: 0.6; transform: none; }
        label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 8px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d9488 100%)', padding: '40px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Consultations
            </p>
            <h1 style={{ fontFamily: 'DM Serif Display', color: 'white', fontSize: 34, fontWeight: 400 }}>
              Book Appointment
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>

            {/* Doctor Info Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 28, marginBottom: 14
                  }}>
                    {doctor?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 17 }}>Dr. {doctor?.fullName}</p>
                  <span style={{ display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: 6, background: '#f0fdfa', color: '#0d9488', fontSize: 12, fontWeight: 600 }}>
                    {doctor?.specialization}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  {doctor?.experience && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>Experience</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{doctor.experience} years</p>
                    </div>
                  )}
                  {doctor?.consultationFee && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>Consultation fee</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>₹{doctor.consultationFee}</p>
                    </div>
                  )}
                  {doctor?.preferredLanguage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>Language</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{doctor.preferredLanguage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability */}
              {doctor?.availability && (
                <div className="card">
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Weekly Availability</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DAYS.map(day => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 13, color: '#64748b' }}>{day}</p>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                          background: doctor.availability[day] ? '#f0fdfa' : '#fef2f2',
                          color: doctor.availability[day] ? '#0d9488' : '#ef4444'
                        }}>
                          {doctor.availability[day] ? 'Available' : 'Off'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Date Selection */}
              <div className="card">
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
                  Select Date & Time
                </p>
                <div style={{ marginBottom: 24 }}>
                  <label>Appointment date</label>
                  <input className="input-field" type="date" min={today}
                    value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    style={{ borderColor: selectedDate && !isAvailable(selectedDate) ? '#ef4444' : undefined }}/>
                  {selectedDate && !isAvailable(selectedDate) && (
                    <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
                      Doctor is not available on {getDayName(selectedDate)}
                    </p>
                  )}
                  {selectedDate && isAvailable(selectedDate) && (
                    <p style={{ fontSize: 12, color: '#0d9488', marginTop: 6 }}>
                      Available on {getDayName(selectedDate)}
                    </p>
                  )}
                </div>

                <div>
                  <label>Select time slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {TIMES.map(time => (
                      <button key={time} type="button"
                        className={`time-chip ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="card">
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
                  Consultation Details
                </p>
                <div>
                  <label>Reason for consultation</label>
                  <textarea className="input-field" value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Describe your symptoms or reason for the appointment..."
                    rows={4} style={{ resize: 'vertical' }}/>
                </div>
              </div>

              {/* Summary & Book */}
              {selectedDate && selectedTime && (
                <div className="card" style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Booking Summary</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Doctor</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>Dr. {doctor?.fullName}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Date</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Time</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{selectedTime}</p>
                    </div>
                    {doctor?.consultationFee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #ccfbf1' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Total fee</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0d9488' }}>₹{doctor.consultationFee}</p>
                      </div>
                    )}
                  </div>
                  <button className="primary-btn" onClick={handleBook} disabled={booking || !isAvailable(selectedDate)}>
                    {booking ? "Booking..." : "Confirm Appointment"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
