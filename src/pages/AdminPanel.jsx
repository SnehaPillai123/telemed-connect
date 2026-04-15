import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "snehahp10@gmail.com"; // Change to your admin email

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("doctors");

  // Check admin access
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) {
      navigate("/patient-dashboard");
      return;
    }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [dSnap, pSnap, aSnap] = await Promise.all([
        getDocs(collection(db, "doctors")),
        getDocs(collection(db, "patients")),
        getDocs(collection(db, "appointments")),
      ]);
      setDoctors(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const apts = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      apts.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      setAppointments(apts);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const toggleDoctorApproval = async (doctorId, current) => {
    try {
      await updateDoc(doc(db, "doctors", doctorId), { approved: !current });
      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, approved: !current } : d));
    } catch(e) { console.error(e); }
  };

  if (user?.email !== ADMIN_EMAIL) return null;

  const stats = [
    { l:"Total Doctors", v:doctors.length, c:"#0d9488", bg:"#f0fdfa" },
    { l:"Total Patients", v:patients.length, c:"#2563eb", bg:"#eff6ff" },
    { l:"Total Appointments", v:appointments.length, c:"#7c3aed", bg:"#f5f3ff" },
    { l:"Pending Approvals", v:doctors.filter(d=>!d.approved).length, c:"#dc2626", bg:"#fef2f2" },
  ];

  return (
    <Layout title="Admin Panel" subtitle="Platform Management">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.3s ease forwards}
        .admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .admin-table{width:100%;border-collapse:collapse}
        .admin-table th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;background:#f9fafb}
        .admin-table td{padding:12px 14px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6}
        .admin-table tr:hover td{background:#fafafa}
        @media(max-width:599px){.admin-stats{grid-template-columns:repeat(2,1fr)!important}.admin-table th,.admin-table td{padding:8px 10px;font-size:12px}}
      `}</style>

      {/* Admin badge */}
      <div style={{ background:"linear-gradient(135deg,#111827,#1f2937)", borderRadius:12, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"white" }}>Admin Panel</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>Logged in as {user?.email}</p>
        </div>
        <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#0d9488", background:"rgba(13,148,136,0.2)", padding:"4px 12px", borderRadius:20 }}>SUPER ADMIN</span>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {stats.map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:10, padding:"14px", border:"1px solid #e5e7eb", textAlign:"center" }}>
            <p style={{ fontSize:24, fontWeight:800, color:s.c, lineHeight:1, marginBottom:4 }}>{loading?"—":s.v}</p>
            <p style={{ fontSize:11, color:"#6b7280" }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={"tab-btn "+(activeTab==="doctors"?"active":"")} onClick={()=>setActiveTab("doctors")}>
          👨‍⚕️ Doctors ({doctors.length})
        </button>
        <button className={"tab-btn "+(activeTab==="patients"?"active":"")} onClick={()=>setActiveTab("patients")}>
          👤 Patients ({patients.length})
        </button>
        <button className={"tab-btn "+(activeTab==="appointments"?"active":"")} onClick={()=>setActiveTab("appointments")}>
          📅 Appointments ({appointments.length})
        </button>
      </div>

      {loading && (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <div style={{ width:30, height:30, border:"3px solid #e5e7eb", borderTopColor:"#0d9488", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        </div>
      )}

      {/* DOCTORS TAB */}
      {!loading && activeTab === "doctors" && (
        <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", overflow:"auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d,i) => (
                <tr key={d.id} className="fade-in" style={{ animationDelay:i*0.03+"s", opacity:0 }}>
                  <td>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:"#f0fdfa", border:"1px solid #ccfbf1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"#0d9488" }}>{(d.fullName||"").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>Dr. {d.fullName}</p>
                        <p style={{ fontSize:11, color:"#9ca3af" }}>{d.email||"—"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{d.specialization||"—"}</td>
                  <td>{d.experience||"—"} yrs</td>
                  <td>₹{d.consultationFee||"—"}</td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:600, color:d.approved!==false?"#16a34a":"#d97706", background:d.approved!==false?"#f0fdf4":"#fffbeb", padding:"3px 9px", borderRadius:20 }}>
                      {d.approved!==false?"Approved":"Pending"}
                    </span>
                  </td>
                  <td>
                    <button onClick={()=>toggleDoctorApproval(d.id, d.approved!==false)}
                      style={{ padding:"5px 12px", background:d.approved!==false?"#fef2f2":"#f0fdf4", color:d.approved!==false?"#dc2626":"#16a34a", border:"1px solid "+(d.approved!==false?"#fecaca":"#bbf7d0"), borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                      {d.approved!==false?"Suspend":"Approve"}
                    </button>
                  </td>
                </tr>
              ))}
              {doctors.length===0 && <tr><td colSpan={6} style={{ textAlign:"center", padding:"40px", color:"#9ca3af" }}>No doctors registered yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* PATIENTS TAB */}
      {!loading && activeTab === "patients" && (
        <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", overflow:"auto" }}>
          <table className="admin-table">
            <thead>
              <tr><th>Patient</th><th>Blood Group</th><th>Phone</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {patients.map((p,i) => (
                <tr key={p.id} className="fade-in" style={{ animationDelay:i*0.03+"s", opacity:0 }}>
                  <td>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"#2563eb" }}>{(p.fullName||"").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"P"}</span>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{p.fullName||"—"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.bloodGroup||"—"}</td>
                  <td>{p.phone||"—"}</td>
                  <td>{p.createdAt?.toDate?.()?.toLocaleDateString("en-IN")||"—"}</td>
                </tr>
              ))}
              {patients.length===0 && <tr><td colSpan={4} style={{ textAlign:"center", padding:"40px", color:"#9ca3af" }}>No patients registered yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {!loading && activeTab === "appointments" && (
        <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", overflow:"auto" }}>
          <table className="admin-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {appointments.slice(0,50).map((a,i) => (
                <tr key={a.id} className="fade-in" style={{ animationDelay:i*0.02+"s", opacity:0 }}>
                  <td>{a.patientName||"—"}</td>
                  <td>Dr. {a.doctorName||"—"}</td>
                  <td>{a.appointmentDate||"—"}</td>
                  <td>{a.appointmentTime||"—"}</td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20,
                      color:a.status==="completed"?"#16a34a":a.status==="confirmed"?"#0d9488":a.status==="cancelled"?"#dc2626":"#d97706",
                      background:a.status==="completed"?"#f0fdf4":a.status==="confirmed"?"#f0fdfa":a.status==="cancelled"?"#fef2f2":"#fffbeb"
                    }}>
                      {(a.status||"pending").charAt(0).toUpperCase()+(a.status||"pending").slice(1)}
                    </span>
                  </td>
                  <td>
                    {a.paymentId ? <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>Paid ✓</span> : <span style={{ fontSize:11, color:"#9ca3af" }}>—</span>}
                  </td>
                </tr>
              ))}
              {appointments.length===0 && <tr><td colSpan={6} style={{ textAlign:"center", padding:"40px", color:"#9ca3af" }}>No appointments yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
