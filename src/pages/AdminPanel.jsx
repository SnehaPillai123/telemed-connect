import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ADMIN_EMAIL = "snehahp10@gmail.com"; // Set your admin email

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) {
      toast.error("Access denied — Admin only");
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    const fetchAll = async () => {
      const [dSnap, pSnap, aSnap] = await Promise.all([
        getDocs(collection(db, "doctors")),
        getDocs(collection(db, "patients")),
        getDocs(collection(db, "appointments")),
      ]);
      setDoctors(dSnap.docs.map(d=>({id:d.id,...d.data()})));
      setPatients(pSnap.docs.map(d=>({id:d.id,...d.data()})));
      setAppointments(aSnap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    };
    fetchAll();
  }, []);

  const toggleDoctorApproval = async (doctorId, current) => {
    await updateDoc(doc(db,"doctors",doctorId), {approved: !current});
    setDoctors(prev => prev.map(d => d.id===doctorId ? {...d, approved:!current} : d));
    toast.success(current ? "Doctor suspended" : "Doctor approved!");
  };

  const stats = [
    {label:"Total Doctors", value:doctors.length, icon:"👨‍⚕️", color:"#0d9488", bg:"#f0fdfa"},
    {label:"Total Patients", value:patients.length, icon:"👥", color:"#2563eb", bg:"#eff6ff"},
    {label:"Total Appointments", value:appointments.length, icon:"📅", color:"#d97706", bg:"#fffbeb"},
    {label:"Completed", value:appointments.filter(a=>a.status==="completed").length, icon:"✅", color:"#16a34a", bg:"#f0fdf4"},
  ];

  return (
    <Layout title="Admin Panel" subtitle="Super Admin">
      <style>{`
        .tab-btn{padding:9px 18px;border:none;background:transparent;font-size:13px;font-weight:600;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
        .tab-btn.active{color:#0d9488;border-bottom-color:#0d9488;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* Admin badge */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12}}>
        <span style={{fontSize:32}}>🛡️</span>
        <div>
          <p style={{fontSize:16, fontWeight:800, color:"white"}}>Super Admin Dashboard</p>
          <p style={{fontSize:12, color:"rgba(255,255,255,0.7)"}}>Full system control — manage doctors, patients, appointments</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:s.bg, borderRadius:14, border:"1px solid #e5e7eb", padding:16, textAlign:"center"}}>
            <div style={{fontSize:28, marginBottom:6}}>{s.icon}</div>
            <p style={{fontSize:28, fontWeight:800, color:s.color, lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:11, color:"#6b7280", marginTop:4}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex", borderBottom:"1px solid #e5e7eb", marginBottom:20}}>
        {["overview","doctors","patients","appointments"].map(t=>(
          <button key={t} className={`tab-btn ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab==="overview" && (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:20}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:12}}>📊 Appointment Status</p>
            {[
              {label:"Pending", count:appointments.filter(a=>a.status==="pending").length, color:"#f59e0b"},
              {label:"Confirmed", count:appointments.filter(a=>a.status==="confirmed").length, color:"#0d9488"},
              {label:"Completed", count:appointments.filter(a=>a.status==="completed").length, color:"#16a34a"},
              {label:"Cancelled", count:appointments.filter(a=>a.status==="cancelled").length, color:"#ef4444"},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<3?"1px solid #f3f4f6":"none"}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span style={{width:8, height:8, borderRadius:"50%", background:s.color, display:"inline-block"}}/>
                  <span style={{fontSize:13, color:"#374151"}}>{s.label}</span>
                </div>
                <span style={{fontSize:16, fontWeight:700, color:s.color}}>{s.count}</span>
              </div>
            ))}
          </div>
          <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", padding:20}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827", marginBottom:12}}>👨‍⚕️ Recent Doctors</p>
            {doctors.slice(0,5).map((d,i)=>(
              <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<4?"1px solid #f3f4f6":"none"}}>
                <div>
                  <p style={{fontSize:13, fontWeight:600, color:"#111827"}}>Dr. {d.fullName}</p>
                  <p style={{fontSize:11, color:"#6b7280"}}>{d.specialization}</p>
                </div>
                <span style={{fontSize:11, fontWeight:600, color:d.approved!==false?"#16a34a":"#f59e0b", background:d.approved!==false?"#f0fdf4":"#fffbeb", padding:"2px 8px", borderRadius:20}}>
                  {d.approved!==false?"Active":"Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctors tab */}
      {activeTab==="doctors" && (
        <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden"}}>
          <div style={{padding:"14px 20px", background:"#f9fafb", borderBottom:"1px solid #e5e7eb"}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827"}}>{doctors.length} Registered Doctors</p>
          </div>
          {doctors.map((d,i)=>(
            <div key={d.id} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:i<doctors.length-1?"1px solid #f3f4f6":"none"}}>
              <div style={{width:40, height:40, borderRadius:10, background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                <span style={{fontSize:12, fontWeight:700, color:"#0d9488"}}>{d.fullName?.split(" ").map(n=>n[0]).join("").slice(0,2)}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:14, fontWeight:700, color:"#111827"}}>Dr. {d.fullName}</p>
                <p style={{fontSize:12, color:"#6b7280"}}>{d.specialization} · ₹{d.consultationFee} · {d.experience} yrs exp</p>
                <p style={{fontSize:11, color:"#9ca3af"}}>{d.email}</p>
              </div>
              <button onClick={()=>toggleDoctorApproval(d.id, d.approved!==false)}
                style={{padding:"7px 14px", background:d.approved!==false?"#fef2f2":"#f0fdf4", color:d.approved!==false?"#dc2626":"#16a34a", border:`1px solid ${d.approved!==false?"#fecaca":"#bbf7d0"}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer"}}>
                {d.approved!==false?"Suspend":"Approve"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Patients tab */}
      {activeTab==="patients" && (
        <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden"}}>
          <div style={{padding:"14px 20px", background:"#f9fafb", borderBottom:"1px solid #e5e7eb"}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827"}}>{patients.length} Registered Patients</p>
          </div>
          {patients.map((p,i)=>(
            <div key={p.id} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:i<patients.length-1?"1px solid #f3f4f6":"none"}}>
              <div style={{width:40, height:40, borderRadius:"50%", background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                <span style={{fontSize:12, fontWeight:700, color:"#2563eb"}}>{p.fullName?.split(" ").map(n=>n[0]).join("").slice(0,2)||"?"}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:14, fontWeight:700, color:"#111827"}}>{p.fullName||"Unknown"}</p>
                <p style={{fontSize:12, color:"#6b7280"}}>{p.email}</p>
                <p style={{fontSize:11, color:"#9ca3af"}}>{p.bloodGroup||"—"} · {p.phone||"—"}</p>
              </div>
              <span style={{fontSize:11, fontWeight:600, color:"#0d9488", background:"#f0fdfa", padding:"3px 10px", borderRadius:20}}>Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Appointments tab */}
      {activeTab==="appointments" && (
        <div style={{background:"white", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden"}}>
          <div style={{padding:"14px 20px", background:"#f9fafb", borderBottom:"1px solid #e5e7eb"}}>
            <p style={{fontSize:13, fontWeight:700, color:"#111827"}}>{appointments.length} Total Appointments</p>
          </div>
          {appointments.slice(0,20).map((a,i)=>(
            <div key={a.id} style={{display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:i<appointments.length-1?"1px solid #f3f4f6":"none"}}>
              <div style={{flex:1}}>
                <p style={{fontSize:13, fontWeight:700, color:"#111827"}}>{a.patientName} → Dr. {a.doctorName}</p>
                <p style={{fontSize:12, color:"#6b7280"}}>{a.appointmentDate} · {a.appointmentTime} · {a.doctorSpecialization}</p>
              </div>
              <span style={{fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
                color:a.status==="completed"?"#16a34a":a.status==="confirmed"?"#0d9488":a.status==="pending"?"#d97706":"#dc2626",
                background:a.status==="completed"?"#f0fdf4":a.status==="confirmed"?"#f0fdfa":a.status==="pending"?"#fffbeb":"#fef2f2",
                textTransform:"capitalize"}}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
