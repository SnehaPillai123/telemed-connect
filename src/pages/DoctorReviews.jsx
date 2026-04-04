import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function DoctorReviews() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("doctorId", "==", doctorId));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReviews(data);
      setAlreadyReviewed(data.some(r => r.patientId === user?.uid));
      if (data.length > 0) setDoctorName(data[0].doctorName);
      setLoading(false);
    };
    fetchReviews();
  }, [doctorId, user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    if (comment.trim().length < 10) return toast.error("Please write at least 10 characters");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        doctorId,
        doctorName,
        patientId: user.uid,
        patientName: user.displayName,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Review submitted!");
      setAlreadyReviewed(true);
      setReviews(prev => [{ id: Date.now(), doctorId, patientId: user.uid, patientName: user.displayName, rating, comment: comment.trim(), createdAt: { seconds: Date.now() / 1000 } }, ...prev]);
      setRating(0);
      setComment("");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRow = ({ value, interactive = false, size = 20 }) => (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill="none"
          style={{ cursor: interactive ? "pointer" : "default", transition: "transform 0.1s" }}
          onClick={() => interactive && setRating(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={s <= (interactive ? (hovered || rating) : Math.round(parseFloat(value))) ? "#f59e0b" : "#e5e7eb"}
            stroke={s <= (interactive ? (hovered || rating) : Math.round(parseFloat(value))) ? "#f59e0b" : "#d1d5db"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ))}
    </div>
  );

  return (
    <Layout title={"Reviews" + (doctorName ? " — Dr. " + doctorName : "")} subtitle="Patient Portal">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Rating summary */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "24px", marginBottom: 20, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <p style={{ fontSize: 56, fontWeight: 900, color: "#111827", lineHeight: 1 }}>{avgRating}</p>
            <StarRow value={avgRating} size={18}/>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280", width: 8 }}>{star}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <div style={{ flex: 1, height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: "#f59e0b", borderRadius: 4, transition: "width 0.5s" }}/>
                </div>
                <span style={{ fontSize: 11, color: "#9ca3af", width: 24 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write review */}
        {!alreadyReviewed ? (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px", marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Write a Review</p>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Your Rating</p>
              <StarRow value={0} interactive size={32}/>
              {rating > 0 && (
                <p style={{ fontSize: 12, color: "#0d9488", marginTop: 6 }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </p>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Your Experience</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this doctor..."
                rows={4}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", fontFamily: "Inter,sans-serif", resize: "vertical" }}
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{comment.length} characters · min 10</p>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "11px 24px", background: submitting ? "#5eead4" : "#0d9488", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif" }}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        ) : (
          <div style={{ background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0", padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <p style={{ fontSize: 13, color: "#15803d" }}>You have already reviewed this doctor.</p>
          </div>
        )}

        {/* Reviews list */}
        <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>All Reviews</p>
        {loading && <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}><div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#0d9488", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/></div>}
        {!loading && reviews.length === 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>No reviews yet. Be the first to review!</p>
          </div>
        )}
        {reviews.map((r, i) => (
          <div key={r.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 18px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0fdfa", border: "1px solid #ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0d9488" }}>
                    {r.patientName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.patientName}</p>
                  <StarRow value={r.rating} size={13}/>
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                {r.createdAt?.toDate?.()?.toLocaleDateString("en-IN") || "Recently"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{r.comment}</p>
          </div>
        ))}

        <button onClick={() => navigate(-1)}
          style={{ width: "100%", padding: "11px", background: "white", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter,sans-serif", marginTop: 8 }}>
          ← Back
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}