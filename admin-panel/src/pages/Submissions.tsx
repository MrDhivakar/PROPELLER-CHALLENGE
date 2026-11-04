import { useEffect, useState } from 'react';
import { listSubmissions, reviewSubmission } from '../api/client';
import type { Submission } from '../api/types';

export function SubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>('submitted');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => {
    listSubmissions(filter === 'all' ? undefined : filter)
      .then(r => setSubs(r.submissions))
      .catch(e => setError(e.message));
  };
  useEffect(load, [filter]);

  const review = async (id: string, decision: 'accepted' | 'returned') => {
    setBusy(id); setError(null);
    try {
      await reviewSubmission(id, decision, notes[id] ?? '');
      load();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <h1>Submissions</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['submitted', 'under_review', 'accepted', 'returned', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? 'primary' : ''}>{s}</button>
        ))}
      </div>
      {error && <div className="error-banner">{error}</div>}
      {subs.length === 0 && <div style={{ color: '#8B96A5' }}>No submissions in this view.</div>}
      {subs.map(s => (
        <div key={s._id} style={{
          background: '#151A22', border: '1px solid #1E2631',
          borderRadius: 12, padding: 20, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.taskId?.title ?? 'Task'}</div>
              <div style={{ fontSize: 12, color: '#8B96A5' }}>
                by {s.userId?.displayName} ({s.userId?.email}) Â· {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <span className={`badge badge-${s.status === 'accepted' ? 'approved' :
              s.status === 'returned' ? 'rejected' : 'draft'}`}>{s.status}</span>
          </div>
          <div style={{
            background: '#0F141B', padding: 12, borderRadius: 8,
            fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 12,
          }}>{s.textResponse || '(no text response)'}</div>
          {s.status === 'submitted' || s.status === 'under_review' ? (
            <>
              <textarea placeholder="Review note (optional)" rows={2}
                value={notes[s._id] ?? ''}
                onChange={e => setNotes({ ...notes, [s._id]: e.target.value })} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="primary" disabled={busy === s._id}
                  onClick={() => review(s._id, 'accepted')}>Accept</button>
                <button className="danger" disabled={busy === s._id}
                  onClick={() => review(s._id, 'returned')}>Return</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#8B96A5' }}>
              Reviewed{s.reviewNote ? `: ${s.reviewNote}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}