import { useState } from "react";
import toast from "react-hot-toast";

// ─── Load Razorpay script dynamically ───────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── PaymentGateway ──────────────────────────────────────────────────────────
// Props:
//   doctor       — { fullName, specialization, consultationFee }
//   patientName  — string
//   onSuccess(paymentId) — called after payment verified
//   onCancel()           — called when user closes the modal
export default function PaymentGateway({ doctor, patientName, onSuccess, onCancel }) {
  const [paying, setPaying] = useState(false);

  // Pull key from env (set VITE_RAZORPAY_KEY_ID in .env)
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_DEMO_KEY";

  const fee = Number(doctor?.consultationFee) || 500;
  const amountPaise = fee * 100; // Razorpay uses paise

  const handlePay = async () => {
    setPaying(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Could not load payment gateway. Check your internet connection.");
      setPaying(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: amountPaise,
      currency: "INR",
      name: "TeleMed Connect",
      description: `Consultation with Dr. ${doctor?.fullName} — ${doctor?.specialization}`,
      image: "https://telemed-connect-6e817.web.app/favicon.ico",
      handler: function (response) {
        // response.razorpay_payment_id is the proof of payment
        toast.success("Payment successful! Booking your appointment…");
        onSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: patientName || "Patient",
        email: "",
        contact: "",
      },
      notes: {
        doctor: doctor?.fullName,
        specialization: doctor?.specialization,
      },
      theme: { color: "#0d9488" },
      modal: {
        ondismiss: () => {
          setPaying(false);
          onCancel();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      toast.error("Payment failed: " + response.error.description);
      setPaying(false);
    });
    rzp.open();
  };

  return (
    <div style={styles.wrapper}>
      {/* ── Payment Summary Card ── */}
      <div style={styles.card}>
        <div style={styles.iconRow}>
          <span style={styles.icon}>💳</span>
          <span style={styles.title}>Secure Payment</span>
        </div>

        <div style={styles.summaryBox}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Doctor</span>
            <span style={styles.summaryValue}>Dr. {doctor?.fullName}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Specialization</span>
            <span style={styles.summaryValue}>{doctor?.specialization}</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Consultation Fee</span>
            <span style={styles.feeAmount}>₹{fee}</span>
          </div>
        </div>

        <div style={styles.secureNote}>
          <span>🔒</span>
          <span>Powered by Razorpay · 100% secure · UPI, Cards, Net Banking accepted</span>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          style={{ ...styles.payBtn, opacity: paying ? 0.7 : 1 }}
        >
          {paying ? (
            <>
              <span style={styles.spinner} />
              Opening Payment Gateway…
            </>
          ) : (
            <>Pay ₹{fee} & Confirm Booking</>
          )}
        </button>

        <button onClick={onCancel} style={styles.cancelBtn}>
          ← Go back
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "32px 16px",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "32px 28px",
    maxWidth: 440,
    width: "100%",
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  icon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: 700, color: "#0d9488" },
  summaryBox: {
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 20,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  summaryValue: { color: "#111827", fontWeight: 600, fontSize: 14 },
  feeAmount: { color: "#0d9488", fontWeight: 700, fontSize: 22 },
  divider: { borderTop: "1px dashed #99f6e4", margin: "12px 0" },
  secureNote: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#6b7280",
    background: "#f9fafb",
    borderRadius: 8,
    padding: "8px 12px",
    marginBottom: 20,
  },
  payBtn: {
    width: "100%",
    padding: "14px 0",
    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    transition: "transform 0.15s",
  },
  cancelBtn: {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};
