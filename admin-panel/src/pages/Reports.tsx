import { useEffect, useState } from 'react';
import { listReports, resolveReport } from '../api/client';
import type { Report } from '../api/types';

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => {
    listReports().then(r => setReports(r.reports)).catch(e => setError(e.message));
  };
  useEffect(load, []);

  const resolve = async (id: string, status: 'resolved' | 'dismissed' | 'under_review') => {
    setBusy(id); setError(null);
    try { await resolveReport(id, status, notes[id] ?? ''); load(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <h1>Safety Reports</h1>
      {error && <div className="error-banner">{error}</div>}
      {reports.length === 0 && <div style={{ color: '#8B96A5' }}>No open reports.</div>}
      {reports.map(r => (
        <div key={r._id} style={{
          background: '#151A22', border: '1px solid #1E2631',
          borderRadius: 12, padding: 20, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.reason}</div>
              <div style={{ fontSize: 12, color: '#8B96A5' }}>
                Task: {r.taskId?.title ?? 'n/a'} Â· Reported by {r.reportedBy?.email ?? 'unknown'}
                {' Â· '}{new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <span className="badge badge-draft">{r.status}</span>
          </div>
          {r.details && (
            <div style={{
              background: '#0F141B', padding: 12, borderRadius: 8,
              fontSize: 14, marginBottom: 12, whiteSpace: 'pre-wrap',
            }}>{r.details}</div>
          )}
          <textarea placeholder="Resolution note (optional)" rows={2}
            value={notes[r._id] ?? ''}
            onChange={e => setNotes({ ...notes, [r._id]: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="primary" disabled={busy === r._id}
              onClick={() => resolve(r._id, 'resolved')}>Resolve</button>
            <button disabled={busy === r._id}
              onClick={() => resolve(r._id, 'dismissed')}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}