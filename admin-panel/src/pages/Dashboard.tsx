import { useEffect, useState } from 'react';
import { getDashboard } from '../api/client';
import type { DashboardStats } from '../api/types';
import { StatCard } from '../components/StatCard';

export function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <div style={{ color: '#8B96A5' }}>Loadingâ€¦</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <StatCard label="Users" value={data.users} />
        <StatCard label="Published Tasks" value={data.publishedTasks} />
        <StatCard label="Pending Submissions" value={data.pendingSubmissions} />
        <StatCard label="Open Reports" value={data.openReports} />
      </div>
      <h2>Recent Admin Activity</h2>
      {data.recentActivity.length === 0 ? (
        <div style={{ color: '#8B96A5' }}>No activity yet.</div>
      ) : (
        <table>
          <thead>
            <tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th></tr>
          </thead>
          <tbody>
            {data.recentActivity.map(a => (
              <tr key={a._id}>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{a.adminId?.email ?? 'â€”'}</td>
                <td>{a.action}</td>
                <td>{a.targetType ?? 'â€”'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}