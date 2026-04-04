import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function PDFPrescription() {
  const { prescriptionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "prescriptions", prescriptionId));
      if (snap.exists()) setRx({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [prescriptionId]);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Dynamically load jsPDF
      const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();

      // Header background
      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, pw, 40, "F");

      // Logo + title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("TeleMed Connect", 14, 16);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("HEALTHCARE PLATFORM", 14, 22);
      pdf.setFontSize(11);
      pdf.text("DIGITAL PRESCRIPTION", pw - 14, 20, { align: "right" });
      pdf.setFontSize(9);
      pdf.text("Date: " + new Date().toLocaleDateString("en-IN"), pw - 14, 27, { align: "right" });

      // Doctor info box
      pdf.setFillColor(240, 253, 250);
      pdf.rect(14, 46, pw - 28, 28, "F");
      pdf.setDrawColor(204, 251, 241);
      pdf.rect(14, 46, pw - 28, 28);
      pdf.setTextColor(13, 148, 136);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("DR. " + (rx.doctorName || "").toUpperCase(), 20, 56);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("Reg. No: MH-" + prescriptionId.slice(0, 6).toUpperCase(), 20, 63);
      pdf.text("Platform: TeleMed Connect", 20, 69);

      // Patient info
      pdf.setFillColor(249, 250, 251);
      pdf.rect(pw / 2, 46, pw / 2 - 14, 28, "F");
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(8);
      pdf.text("PATIENT NAME", pw / 2 + 6, 54);
      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(rx.patientName || "—", pw / 2 + 6, 61);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text("DATE OF CONSULTATION", pw / 2 + 6, 67);
      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(9);
      pdf.text(rx.createdAt?.toDate?.()?.toLocaleDateString("en-IN") || "—", pw / 2 + 6, 72);

      // Diagnosis
      let y = 86;
      pdf.setFillColor(239, 246, 255);
      pdf.rect(14, y - 6, pw - 28, 14, "F");
      pdf.setTextColor(37, 99, 235);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("DIAGNOSIS", 20, y);
      pdf.setTextColor(17, 24, 39);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(rx.diagnosis || "—", 20, y + 6);
      y += 18;

      // Medicines header
      pdf.setFillColor(13, 148, 136);
      pdf.rect(14, y, pw - 28, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Rx  MEDICINES", 20, y + 5.5);
      y += 12;

      // Medicines list
      (rx.medicines || []).forEach((med, idx) => {
        if (y > 240) { pdf.addPage(); y = 20; }
        const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        pdf.setFillColor(...bg);
        pdf.rect(14, y - 2, pw - 28, 20, "F");
        pdf.setDrawColor(229, 231, 235);
        pdf.line(14, y + 18, pw - 14, y + 18);

        // Number badge
        pdf.setFillColor(13, 148, 136);
        pdf.circle(22, y + 8, 4, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(idx + 1), 22, y + 10, { align: "center" });

        // Med name
        pdf.setTextColor(17, 24, 39);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(med.name || "", 30, y + 7);

        // Tags
        let tagX = 30;
        const tags = [med.dosage, med.frequency, med.duration].filter(Boolean);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        tags.forEach(tag => {
          pdf.setFillColor(240, 253, 250);
          const tw = pdf.getTextWidth(tag) + 8;
          pdf.rect(tagX, y + 10, tw, 5, "F");
          pdf.setTextColor(13, 148, 136);
          pdf.text(tag, tagX + 4, y + 14);
          tagX += tw + 4;
        });
        y += 22;
      });

      // Notes
      if (rx.notes) {
        y += 4;
        pdf.setFillColor(255, 251, 235);
        pdf.rect(14, y, pw - 28, 20, "F");
        pdf.setDrawColor(253, 230, 138);
        pdf.rect(14, y, pw - 28, 20);
        pdf.setTextColor(146, 64, 14);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Doctor's Notes:", 20, y + 7);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const noteLines = pdf.splitTextToSize(rx.notes, pw - 40);
        pdf.text(noteLines, 20, y + 13);
        y += 24;
      }

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 20;
      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, footerY, pw, 20, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("TeleMed Connect · telemed-connect-6e817.web.app", pw / 2, footerY + 8, { align: "center" });
      pdf.text("This is a digitally generated prescription. Valid for 30 days from date of issue.", pw / 2, footerY + 14, { align: "center" });

      pdf.save("Prescription_" + (rx.patientName || "Patient").replace(" ", "_") + "_" + new Date().toISOString().split("T")[0] + ".pdf");
      setGenerating(false);
    } catch (err) {
      console.error(err);
      setGenerating(false);
      alert("PDF generation failed. Please try again.");
    }
  };

  if (loading) return (
    <Layout title="Prescription" subtitle="Patient Portal">
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ width: 30, height: 30, border: "3px solid #e5e7eb", borderTopColor: "#0d9488", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  );

  if (!rx) return (
    <Layout title="Prescription" subtitle="Patient Portal">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "#6b7280" }}>Prescription not found.</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Digital Prescription" subtitle="Patient Portal">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Preview card */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#0d9488,#0284c7)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "white" }}>TeleMed Connect</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Digital Prescription</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Date</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{rx.createdAt?.toDate?.()?.toLocaleDateString("en-IN") || "Recently"}</p>
            </div>
          </div>

          {/* Doctor + Patient */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ padding: "16px 20px", background: "#f0fdfa" }}>
              <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Prescribing Doctor</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0d9488" }}>Dr. {rx.doctorName}</p>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Patient</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{rx.patientName}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ padding: "16px 20px", background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
            <p style={{ fontSize: 10, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Diagnosis</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>{rx.diagnosis}</p>
          </div>

          {/* Medicines */}
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Rx Medicines</p>
            {rx.medicines?.map((med, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < rx.medicines.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{med.name}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[med.dosage, med.frequency, med.duration].filter(Boolean).map((tag, j) => (
                      <span key={j} style={{ fontSize: 11, color: "#0d9488", background: "#f0fdfa", padding: "3px 9px", borderRadius: 20, border: "1px solid #ccfbf1" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rx.notes && (
            <div style={{ padding: "14px 20px", background: "#fffbeb", borderTop: "1px solid #fde68a" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Doctor's Notes</p>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{rx.notes}</p>
            </div>
          )}
        </div>

        {/* Download button */}
        <button onClick={generatePDF} disabled={generating}
          style={{ width: "100%", padding: "14px", background: generating ? "#5eead4" : "#0d9488", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          {generating ? (
            <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Generating PDF...</>
          ) : (
            <><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>Download PDF Prescription</>
          )}
        </button>
        <button onClick={() => navigate(-1)}
          style={{ width: "100%", padding: "11px", background: "white", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
          ← Back
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  );
}