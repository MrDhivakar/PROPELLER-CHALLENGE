export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      background: '#151A22', border: '1px solid #1E2631', borderRadius: 12,
      padding: 20, flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 11, color: '#8B96A5', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, marginTop: 8 }}>{value}</div>
    </div>
  );
}