import { useEffect, useState } from 'react';
import { approveTask, assignTask, createTask, listTasks, publishTask, rejectTask } from '../api/client';
import type { Task } from '../api/types';

const CATEGORIES = ['drawing', 'puzzle', 'learning', 'writing', 'organizing', 'reflection'];
const DIFFICULTIES = ['gentle', 'moderate', 'focus'];

const emptyForm = {
  title: '', description: '', category: 'drawing',
  difficulty: 'gentle', estimatedMinutes: 15,
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    listTasks().then(r => setTasks(r.tasks)).catch(e => setError(e.message));
  };
  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('create'); setError(null); setSuccess(null);
    try {
      await createTask(form);
      setForm(emptyForm); setShowForm(false);
      setSuccess('Task created as draft. Approve, then publish, then assign.');
      load();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(null); }
  };

  const action = async (id: string, label: string, fn: () => Promise<any>) => {
    setBusy(id); setError(null); setSuccess(null);
    try { await fn(); setSuccess(label); load(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Tasks</h1>
        <button className="primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <form onSubmit={submit} style={{
          background: '#151A22', border: '1px solid #1E2631',
          borderRadius: 12, padding: 20, marginTop: 16,
        }}>
          <label>Title (5-100 chars)</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            minLength={5} maxLength={100} required />
          <label>Description (20-2000 chars)</label>
          <textarea value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            minLength={20} maxLength={2000} rows={5} required />
          <label>Category</label>
          <select value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label>Difficulty</label>
          <select value={form.difficulty}
            onChange={e => setForm({ ...form, difficulty: e.target.value })}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <label>Estimated minutes (1-120)</label>
          <input type="number" min={1} max={120} value={form.estimatedMinutes}
            onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
          <button type="submit" className="primary"
            style={{ marginTop: 16 }} disabled={busy === 'create'}>
            {busy === 'create' ? 'Creatingâ€¦' : 'Create Draft'}
          </button>
        </form>
      )}

      <table style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Title</th><th>Category</th><th>Safety</th><th>Publish</th>
            <th>Created</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t._id}>
              <td>{t.title}</td>
              <td>{t.category}</td>
              <td><span className={`badge badge-${t.safetyStatus === 'approved' ? 'approved' :
                t.safetyStatus === 'rejected' ? 'rejected' : 'draft'}`}>{t.safetyStatus}</span></td>
              <td><span className={`badge badge-${t.publishStatus === 'published' ? 'published' : 'draft'}`}>
                {t.publishStatus}</span></td>
              <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.safetyStatus !== 'approved' && (
                  <button disabled={busy === t._id}
                    onClick={() => action(t._id, 'Task approved', () => approveTask(t._id))}>
                    Approve
                  </button>
                )}
                {t.safetyStatus === 'pending_review' && (
                  <button className="danger" disabled={busy === t._id}
                    onClick={() => action(t._id, 'Task rejected', () => rejectTask(t._id))}>
                    Reject
                  </button>
                )}
                {t.safetyStatus === 'approved' && t.publishStatus !== 'published' && (
                  <button disabled={busy === t._id}
                    onClick={() => action(t._id, 'Task published', () => publishTask(t._id))}>
                    Publish
                  </button>
                )}
                {t.publishStatus === 'published' && (
                  <button disabled={busy === t._id}
                    onClick={() => action(t._id, 'Assigned to all users',
                      () => assignTask(t._id, true))}>
                    Assign to All
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}