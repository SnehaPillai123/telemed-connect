import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function AppointmentCalendar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const field = role === "doctor" ? "doctorId" : "patientId";
      const q = query(collection(db, "appointments"), where(field, "==", user.uid));
      const snap = await getDocs(q);
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetch();
  }, [user, role]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getAptsForDate = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return appointments.filter(a => a.appointmentDate === dateStr);
  };

  const selectedApts = selectedDate ? getAptsForDate(selectedDate) : [];

  const STATUS_COLOR = {
    pending: "#f59e0b",
    confirmed: "#0d9488",
    completed: "#16a34a",
    cancelled: "#ef4444",
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day) => today.getDate()===day && today.getMonth()===month && today.getFullYear()===year;

  return (
    <Layout title="Appointment Calendar" subtitle="Schedule">
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .cal-day{min-height:64px;border-radius:10px;padding:6px;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;position:relative;}
        .cal-day:hover{background:#f0fdfa;border-color:#99f6e4;}
        .cal-day.has-apt{background:#f0fdfa;border-color:#99f6e4;}
        .cal-day.selected{background:#0d9488;border-color:#0d9488;}
        .cal-day.selected .day-num{color:white!important;}
        .cal-day.today .day-num{background:#0d9488;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;}
        .cal-day.empty{cursor:default;background:transparent;}
        .apt-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin:1px;}
      `}</style>

      <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start"}}>
        {/* Calendar */}
        <div style={{background:"white", borderRadius:16, border:"1px solid #e5e7eb", overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#0d9488,#0284c7)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <button onClick={prevMonth} style={{background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, width:36, height:36, cursor:"pointer", color:"white", fontSize:18}}>‹</button>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:20, fontWeight:800, color:"white"}}>{monthNames[month]} {year}</p>
              <p style={{fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2}}>{appointments.length} total appointments</p>
            </div>
            <button onClick={nextMonth} style={{background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, width:36, height:36, cursor:"pointer", color:"white", fontSize:18}}>›</button>
          </div>

          {/* Day names */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, padding:"16px 16px 8px"}}>
            {dayNames.map(d => (
              <div key={d} style={{textAlign:"center", fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase"}}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, padding:"0 16px 16px"}}>
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={"empty-"+i} className="cal-day empty"/>
            ))}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const dayApts = getAptsForDate(day);
              return (
                <div key={day}
                  className={`cal-day ${dayApts.length>0?"has-apt":""} ${selectedDate===day?"selected":""} ${isToday(day)?"today":""}`}
                  onClick={() => setSelectedDate(selectedDate===day ? null : day)}>
                  <div className="day-num" style={{fontSize:13, fontWeight:600, color:"#374151", marginBottom:4}}>{day}</div>
                  <div style={{display:"flex", flexWrap:"wrap", gap:2}}>
                    {dayApts.slice(0,3).map((a,i) => (
                      <span key={i} className="apt-dot" style={{background: STATUS_COLOR[a.status]||"#6b7280"}}/>
                    ))}
                    {dayApts.length>3 && <span style={{fontSize:9, color:"#6b7280"}}>+{dayApts.length-3}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{padding:"12px 16px", borderTop:"1px solid #f3f4f6", display:"flex", gap:16, flexWrap:"wrap"}}>
            {Object.entries(STATUS_COLOR).map(([status, color]) => (
              <div key={status} style={{display:"flex", alignItems:"center", gap:5}}>
                <span style={{width:8, height:8, borderRadius:"50%", background:color, display:"inline-block"}}/>
                <span style={{fontSize:11, color:"#6b7280", textTransform:"capitalize"}}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          {/* Stats */}
          <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:16}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:12}}>📊 This Month</p>
            {[
              {label:"Total", value: appointments.filter(a=>a.appointmentDate?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length, color:"#0d9488"},
              {label:"Confirmed", value: appointments.filter(a=>a.status==="confirmed" && a.appointmentDate?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length, color:"#16a34a"},
              {label:"Pending", value: appointments.filter(a=>a.status==="pending" && a.appointmentDate?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length, color:"#f59e0b"},
              {label:"Completed", value: appointments.filter(a=>a.status==="completed" && a.appointmentDate?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length, color:"#2563eb"},
            ].map((s,i) => (
              <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<3?"1px solid #f3f4f6":"none"}}>
                <span style={{fontSize:13, color:"#6b7280"}}>{s.label}</span>
                <span style={{fontSize:16, fontWeight:700, color:s.color}}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Selected date appointments */}
          <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:16}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:12}}>
              {selectedDate ? `📅 ${monthNames[month]} ${selectedDate}` : "📅 Select a date"}
            </p>
            {!selectedDate && (
              <p style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:"20px 0"}}>Click any date to see appointments</p>
            )}
            {selectedDate && selectedApts.length === 0 && (
              <p style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:"20px 0"}}>No appointments on this date</p>
            )}
            {selectedApts.map((apt, i) => (
              <div key={i} style={{padding:"10px 12px", background:"#f9fafb", borderRadius:10, marginBottom:8, borderLeft:`3px solid ${STATUS_COLOR[apt.status]||"#6b7280"}`}}>
                <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:3}}>
                  {role==="doctor" ? apt.patientName : `Dr. ${apt.doctorName}`}
                </p>
                <p style={{fontSize:12, color:"#6b7280"}}>{apt.appointmentTime}</p>
                <p style={{fontSize:11, color:"#9ca3af", marginTop:2}}>{apt.reason?.slice(0,40)}...</p>
                <span style={{fontSize:10, fontWeight:600, color:STATUS_COLOR[apt.status], background:STATUS_COLOR[apt.status]+"20", padding:"2px 8px", borderRadius:20, marginTop:4, display:"inline-block", textTransform:"capitalize"}}>{apt.status}</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate(role==="doctor" ? "/doctor-appointments" : "/my-appointments")}
            style={{padding:"11px", background:"#0d9488", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer"}}>
            View All Appointments →
          </button>
        </div>
      </div>
    </Layout>
  );
}
