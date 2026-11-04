import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/tasks', label: 'Daily Tasks' },
  { to: '/games', label: 'Location Games' }, // NEW LINK
  { to: '/submissions', label: 'Submissions' },
  { to: '/reports', label: 'Reports' },
  { to: '/logs', label: 'Activity Logs' },
];

export function Layout() {
  const { logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: '#0F141B', padding: '24px 16px',
        borderRight: '1px solid #1E2631', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <img src="/logo.svg" alt="" width={32} height={32} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Propeller</div>
            <div style={{ fontSize: 11, color: '#8B96A5' }}>Admin</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to} end={l.to === '/'}
              style={({ isActive }) => ({
                padding: '10px 12px', borderRadius: 8,
                color: isActive ? '#E6EAF0' : '#8B96A5',
                background: isActive ? '#151A22' : 'transparent',
                fontSize: 14, textDecoration: 'none',
              })}
            >{l.label}</NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 16 }}>Log out</button>
      </aside>
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1400, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
