import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function HealthAnalytics() {
  const { user, role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState([
    {date:"2026-01-01",bp:"120/80",weight:62,glucose:95},
    {date:"2026-01-15",bp:"118/78",weight:61.5,glucose:92},
    {date:"2026-02-01",bp:"122/82",weight:62,glucose:98},
    {date:"2026-02-15",bp:"119/79",weight:61,glucose:90},
    {date:"2026-03-01",bp:"121/80",weight:61.5,glucose:94},
    {date:"2026-03-15",bp:"117/77",weight:60.5,glucose:88},
    {date:"2026-04-01",bp:"120/80",weight:61,glucose:92},
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const field = role==="doctor" ? "doctorId" : "patientId";
      const aSnap = await getDocs(query(collection(db,"appointments"), where(field,"==",user.uid)));
      const pSnap = await getDocs(query(collection(db,"prescriptions"), where(field,"==",user.uid)));
      setAppointments(aSnap.docs.map(d=>({id:d.id,...d.data()})));
      setPrescriptions(pSnap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    };
    fetchData();
  }, [user, role]);

  const statusCounts = {
    completed: appointments.filter(a=>a.status==="completed").length,
    confirmed: appointments.filter(a=>a.status==="confirmed").length,
    pending: appointments.filter(a=>a.status==="pending").length,
    cancelled: appointments.filter(a=>a.status==="cancelled").length,
  };
  const total = appointments.length || 1;

  // Mini bar chart component
  const BarChart = ({ data, color, label, unit }) => {
    const max = Math.max(...data.map(d=>d.value), 1);
    return (
      <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:20}}>
        <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:16}}>{label}</p>
        <div style={{display:"flex", alignItems:"flex-end", gap:8, height:80}}>
          {data.map((d,i) => (
            <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4}}>
              <span style={{fontSize:9, color:"#9ca3af"}}>{d.value}{unit}</span>
              <div style={{width:"100%", background:color, borderRadius:"4px 4px 0 0", height:`${(d.value/max)*70}px`, transition:"height 0.5s", minHeight:4}}/>
              <span style={{fontSize:9, color:"#9ca3af", textAlign:"center"}}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const weightData = vitals.map(v=>({label:v.date.slice(5), value:v.weight}));
  const glucoseData = vitals.map(v=>({label:v.date.slice(5), value:v.glucose}));
  const bpSystolic = vitals.map(v=>({label:v.date.slice(5), value:parseInt(v.bp.split("/")[0])}));

  return (
    <Layout title="Health Analytics" subtitle="Patient Portal">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Top stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20}}>
        {[
          {label:"Total Visits", value:appointments.length, icon:"🏥", color:"#0d9488", bg:"#f0fdfa"},
          {label:"Prescriptions", value:prescriptions.length, icon:"💊", color:"#2563eb", bg:"#eff6ff"},
          {label:"Completed", value:statusCounts.completed, icon:"✅", color:"#16a34a", bg:"#f0fdf4"},
          {label:"Upcoming", value:statusCounts.confirmed+statusCounts.pending, icon:"📅", color:"#d97706", bg:"#fffbeb"},
        ].map((s,i)=>(
          <div key={i} style={{background:s.bg, borderRadius:14, border:"1px solid #e5e7eb", padding:16, textAlign:"center"}}>
            <div style={{fontSize:28, marginBottom:6}}>{s.icon}</div>
            <p style={{fontSize:26, fontWeight:800, color:s.color, lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:11, color:"#6b7280", marginTop:4}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Appointment breakdown donut-style */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16}}>
        <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:20}}>
          <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:16}}>📊 Appointment Breakdown</p>
          {[
            {label:"Completed", count:statusCounts.completed, color:"#16a34a"},
            {label:"Confirmed", count:statusCounts.confirmed, color:"#0d9488"},
            {label:"Pending", count:statusCounts.pending, color:"#f59e0b"},
            {label:"Cancelled", count:statusCounts.cancelled, color:"#ef4444"},
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span style={{fontSize:12, color:"#374151"}}>{s.label}</span>
                <span style={{fontSize:12, fontWeight:600, color:s.color}}>{s.count}</span>
              </div>
              <div style={{height:7, background:"#f3f4f6", borderRadius:4, overflow:"hidden"}}>
                <div style={{width:`${(s.count/total)*100}%`, height:"100%", background:s.color, borderRadius:4, transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:20}}>
          <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:16}}>💊 Recent Medicines</p>
          {prescriptions.length === 0 && <p style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:"20px 0"}}>No prescriptions yet</p>}
          {prescriptions.slice(0,4).map((rx,i)=>(
            <div key={i} style={{padding:"8px 0", borderBottom:i<3?"1px solid #f3f4f6":"none"}}>
              <p style={{fontSize:13, fontWeight:600, color:"#111827"}}>{rx.diagnosis}</p>
              <p style={{fontSize:11, color:"#6b7280"}}>{rx.medicines?.length||0} medicine(s) · Dr. {rx.doctorName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vitals Charts */}
      <p style={{fontSize:14, fontWeight:700, color:"#111827", marginBottom:12}}>📈 Health Vitals Trend</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16}}>
        <BarChart data={weightData} color="#0d9488" label="⚖️ Weight (kg)" unit=""/>
        <BarChart data={glucoseData} color="#2563eb" label="🩸 Glucose (mg/dL)" unit=""/>
        <BarChart data={bpSystolic} color="#dc2626" label="❤️ Systolic BP (mmHg)" unit=""/>
      </div>

      {/* Vitals table */}
      <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden"}}>
        <div style={{padding:"14px 20px", borderBottom:"1px solid #f3f4f6", background:"#f9fafb", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <p style={{fontSize:13, fontWeight:700, color:"#111827"}}>📋 Vitals History</p>
          <span style={{fontSize:11, color:"#6b7280"}}>Sample data — update via Health Profile</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                {["Date","Blood Pressure","Weight","Glucose","Status"].map(h=>(
                  <th key={h} style={{padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitals.map((v,i)=>{
                const sys = parseInt(v.bp.split("/")[0]);
                const bpStatus = sys < 120 ? "Normal" : sys < 130 ? "Elevated" : "High";
                const bpColor = sys < 120 ? "#16a34a" : sys < 130 ? "#d97706" : "#dc2626";
                return (
                  <tr key={i} style={{borderTop:"1px solid #f3f4f6"}}>
                    <td style={{padding:"10px 16px", fontSize:13, color:"#374151"}}>{v.date}</td>
                    <td style={{padding:"10px 16px", fontSize:13, fontWeight:600, color:"#111827"}}>{v.bp}</td>
                    <td style={{padding:"10px 16px", fontSize:13, color:"#374151"}}>{v.weight} kg</td>
                    <td style={{padding:"10px 16px", fontSize:13, color:"#374151"}}>{v.glucose} mg/dL</td>
                    <td style={{padding:"10px 16px"}}>
                      <span style={{fontSize:11, fontWeight:600, color:bpColor, background:bpColor+"20", padding:"2px 8px", borderRadius:20}}>{bpStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
