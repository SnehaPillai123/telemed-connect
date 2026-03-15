{/* Stats */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
  {[
    { label: 'Upcoming Appointments', value: stats.upcoming },
    { label: 'Confirmed', value: stats.confirmed },
    { label: 'Completed Visits', value: stats.completed },
  ].map((s, i) => (
    <div key={i} style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{s.label}</p>
      <p style={{ fontSize: 36, fontWeight: 700, color: '#0d9488', lineHeight: 1 }}>
        {loading ? '—' : s.value}
      </p>
    </div>
  ))}
</div>