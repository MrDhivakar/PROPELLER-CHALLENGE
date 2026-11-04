import { useEffect, useState } from 'react';
import { listUsers, setUserStatus } from '../api/client';
import type { User } from '../api/types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    listUsers({ limit: 100 }).then(r => { setUsers(r.users); setTotal(r.total); })
      .catch(e => setError(e.message));
  };
  useEffect(load, []);

  const changeStatus = async (u: User, status: 'active' | 'suspended') => {
    setBusy(u.id); setError(null);
    try {
      await setUserStatus(u.id, status);
      load();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <h1>Users</h1>
      <div style={{ color: '#8B96A5', marginBottom: 16 }}>{total} total</div>
      {error && <div className="error-banner">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Age</th><th>Location</th>
            <th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.displayName}</td>
              <td>{u.email}</td>
              <td>{u.age ?? 'â€”'}</td>
              <td>{[u.city, u.state, u.country].filter(Boolean).join(', ') || 'â€”'}</td>
              <td><span className={`badge badge-${u.accountStatus.split('_')[0]}`}>{u.accountStatus}</span></td>
              <td>
                {u.accountStatus === 'suspended' ? (
                  <button disabled={busy === u.id}
                    onClick={() => changeStatus(u, 'active')}>Reactivate</button>
                ) : (
                  <button disabled={busy === u.id} className="danger"
                    onClick={() => changeStatus(u, 'suspended')}>Suspend</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}