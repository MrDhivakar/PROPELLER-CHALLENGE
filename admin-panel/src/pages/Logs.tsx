import { useEffect, useState } from 'react';
import { listLogs } from '../api/client';
import type { LogEntry } from '../api/types';

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLogs(200).then(r => setLogs(r.logs)).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Activity Logs</h1>
      {error && <div className="error-banner">{error}</div>}
      <table>
        <thead>
          <tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th></tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id}>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td>{l.adminId?.email ?? 'â€”'}</td>
              <td>{l.action}</td>
              <td>{l.targetType ?? 'â€”'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}