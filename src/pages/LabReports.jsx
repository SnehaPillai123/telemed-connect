import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function LabReports() {
  const { user, role } = useAuth();
  const fileRef = useRef(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Blood Test");
  const [dragOver, setDragOver] = useState(false);

  const REPORT_TYPES = ["Blood Test", "Urine Test", "X-Ray", "MRI Scan", "CT Scan", "ECG", "Ultrasound", "Other"];

  useEffect(() => {
    const fetchReports = async () => {
      const field = role === "doctor" ? "doctorId" : "patientId";
      const q = query(collection(db, "labReports"), where(field, "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, [user, role]);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!reportName.trim()) return toast.error("Please enter a report name");
    if (file.size > 10 * 1024 * 1024) return toast.error("File too large. Max 10MB.");

    setUploading(true);
    setProgress(0);

    try {
      const fileName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageRef = ref(storage, "labReports/" + user.uid + "/" + fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed",
        (snapshot) => {
          setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (error) => {
          toast.error("Upload failed: " + error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const doc = await addDoc(collection(db, "labReports"), {
            patientId: user.uid,
            patientName: user.displayName,
            reportName: reportName.trim(),
            reportType,
            fileName: file.name,
            fileURL: downloadURL,
            fileSize: file.size,
            fileType: file.type,
            createdAt: serverTimestamp(),
          });
          setReports(prev => [{
            id: doc.id,
            patientId: user.uid,
            patientName: user.displayName,
            reportName: reportName.trim(),
            reportType,
            fileName: file.name,
            fileURL: downloadURL,
            fileSize: file.size,
            fileType: file.type,
            createdAt: { seconds: Date.now() / 1000 }
          }, ...prev]);
          setReportName("");
          setProgress(0);
          setUploading(false);
          toast.success("Report uploaded successfully!");
        }
      );
    } catch (err) {
      toast.error("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTypeColor = (type) => {
    const colors = { "Blood Test": "#dc2626", "X-Ray": "#7c3aed", "MRI Scan": "#2563eb", "CT Scan": "#0d9488", "ECG": "#d97706", "Ultrasound": "#16a34a" };
    return colors[type] || "#6b7280";
  };

  return (
    <Layout title="Lab Reports" subtitle="Patient Portal">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.3s ease forwards}
        .form-input{width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;color:#111827;background:white;outline:none;transition:all 0.2s;font-family:Inter,sans-serif;}
        .form-input:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
      `}</style>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { l: "Total Reports", v: reports.length, c: "#0d9488", bg: "#f0fdfa" },
          { l: "This Month", v: reports.filter(r => new Date(r.createdAt?.seconds * 1000).getMonth() === new Date().getMonth()).length, c: "#2563eb", bg: "#eff6ff" },
          { l: "Report Types", v: [...new Set(reports.map(r => r.reportType))].length, c: "#d97706", bg: "#fffbeb" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: "14px", border: "1px solid #e5e7eb", textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.c, lineHeight: 1, marginBottom: 4 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: "#6b7280" }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Upload section — only for patients */}
      {role === "patient" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px", marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Upload New Report</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Report Name *</label>
              <input className="form-input" placeholder="e.g. Complete Blood Count" value={reportName} onChange={e => setReportName(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Report Type</label>
              <select className="form-input" value={reportType} onChange={e => setReportType(e.target.value)}>
                {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Drag & drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: "2px dashed " + (dragOver ? "#0d9488" : "#e5e7eb"), borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#f0fdfa" : "#fafafa", transition: "all 0.2s" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: dragOver ? "#f0fdfa" : "#f3f4f6", border: "1px solid " + (dragOver ? "#ccfbf1" : "#e5e7eb"), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke={dragOver ? "#0d9488" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: dragOver ? "#0d9488" : "#374151", marginBottom: 4 }}>
              {dragOver ? "Drop to upload" : "Click or drag & drop your report"}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>PDF, JPG, PNG up to 10MB</p>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
              onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); }}/>
          </div>

          {uploading && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 13, color: "#374151" }}>Uploading...</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0d9488" }}>{progress}%</p>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: progress + "%", height: "100%", background: "#0d9488", borderRadius: 4, transition: "width 0.3s" }}/>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports list */}
      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
        {role === "doctor" ? "Patient Reports Shared" : "Your Lab Reports"}
      </p>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#0d9488", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "48px", textAlign: "center" }}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" style={{ margin: "0 auto 14px", display: "block" }}>
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No lab reports yet</p>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            {role === "patient" ? "Upload your lab reports to share with your doctor." : "No reports shared by patients yet."}
          </p>
        </div>
      )}

      {reports.map((r, i) => (
        <div key={r.id} className="fade-in" style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "center", animationDelay: i * 0.04 + "s", opacity: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: getTypeColor(r.reportType) + "15", border: "1px solid " + getTypeColor(r.reportType) + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke={getTypeColor(r.reportType)} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reportName}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: getTypeColor(r.reportType), background: getTypeColor(r.reportType) + "15", padding: "2px 8px", borderRadius: 20 }}>{r.reportType}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatSize(r.fileSize || 0)}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.createdAt?.toDate?.()?.toLocaleDateString("en-IN") || "Recently"}</span>
              {role === "doctor" && <span style={{ fontSize: 11, color: "#0d9488", fontWeight: 500 }}>by {r.patientName}</span>}
            </div>
          </div>
          <a href={r.fileURL} target="_blank" rel="noreferrer"
            style={{ padding: "8px 14px", background: "#0d9488", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            View
          </a>
        </div>
      ))}
    </Layout>
  );
}