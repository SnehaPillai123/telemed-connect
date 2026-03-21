import { useNavigate } from "react-router-dom";

export default function NextStepBanner({ icon, title, desc, btnLabel, btnPath, btnSecondaryLabel, btnSecondaryPath, color = "teal" }) {
  const navigate = useNavigate();

  const COLORS = {
    teal:   { bg: "#f0fdfa", border: "#ccfbf1", accent: "#0d9488", btnBg: "#0d9488", btnHover: "#0f766e" },
    blue:   { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb", btnBg: "#2563eb", btnHover: "#1d4ed8" },
    purple: { bg: "#f5f3ff", border: "#ddd6fe", accent: "#7c3aed", btnBg: "#7c3aed", btnHover: "#6d28d9" },
    green:  { bg: "#f0fdf4", border: "#bbf7d0", accent: "#16a34a", btnBg: "#16a34a", btnHover: "#15803d" },
    orange: { bg: "#fffbeb", border: "#fde68a", accent: "#d97706", btnBg: "#d97706", btnHover: "#b45309" },
  };

  const c = COLORS[color] || COLORS.teal;

  const goTo = (path) => {
    if (!path) return;
    if (path.startsWith("http")) window.open(path, "_blank");
    else navigate(path);
  };

  return (
    <>
      <style>{`
        .nsb-wrap { border-radius:14px; border:1.5px solid ${c.border}; background:${c.bg}; padding:20px 24px; display:flex; align-items:center; gap:20px; margin-top:28px; flex-wrap:wrap; }
        .nsb-icon { width:52px; height:52px; border-radius:12px; background:${c.accent}; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:24px; }
        .nsb-text { flex:1; min-width:160px; }
        .nsb-title { font-size:15px; font-weight:700; color:#111827; margin-bottom:4px; }
        .nsb-desc  { font-size:13px; color:#6b7280; line-height:1.5; }
        .nsb-btns  { display:flex; gap:10px; flex-shrink:0; flex-wrap:wrap; }
        .nsb-btn-primary { padding:10px 22px; background:${c.btnBg}; color:white; border:none; border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; transition:all 0.2s; white-space:nowrap; }
        .nsb-btn-primary:hover { background:${c.btnHover}; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.15); }
        .nsb-btn-secondary { padding:10px 18px; background:white; color:#374151; border:1.5px solid #e5e7eb; border-radius:9px; font-size:13px; font-weight:500; cursor:pointer; font-family:Inter,sans-serif; transition:all 0.2s; white-space:nowrap; }
        .nsb-btn-secondary:hover { border-color:${c.accent}; color:${c.accent}; }
        @media screen and (max-width:599px) { .nsb-wrap { flex-direction:column; align-items:flex-start; } .nsb-btns { width:100%; } .nsb-btn-primary,.nsb-btn-secondary { flex:1; text-align:center; } }
      `}</style>
      <div className="nsb-wrap">
        <div className="nsb-icon">{icon}</div>
        <div className="nsb-text">
          <p className="nsb-title">{title}</p>
          <p className="nsb-desc">{desc}</p>
        </div>
        <div className="nsb-btns">
          {btnSecondaryLabel && btnSecondaryPath && (
            <button className="nsb-btn-secondary" onClick={() => goTo(btnSecondaryPath)}>
              {btnSecondaryLabel}
            </button>
          )}
          <button className="nsb-btn-primary" onClick={() => goTo(btnPath)}>
            {btnLabel} →
          </button>
        </div>
      </div>
    </>
  );
}
