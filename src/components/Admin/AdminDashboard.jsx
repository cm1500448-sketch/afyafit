// Import icons for UI elements
import { BarChart3, ClipboardList, FileText, UserCheck, Users } from 'lucide-react';

// Import React hooks for state and lifecycle management
import { useCallback, useEffect, useState } from 'react';
import AdminCoachAssignments from './AdminCoachAssignments';
import AdminCoachRequests from './AdminCoachRequests';
import ReportButton from '../Reports/ReportButton';
import './AdminDashboard.css';

const AdminDashboard = () => {

  const [view, setView]             = useState('users');
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading]       = useState(false);
  const [logs, setLogs]             = useState([]);
  const [analytics, setAnalytics]   = useState(null);

  // Coach applications state
  const [coachApplications, setCoachApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appMsg, setAppMsg]         = useState('');

  // ── Data fetchers ────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const q = new URLSearchParams({ page: page || 1, limit: 20 });
      if (roleFilter) q.set('role', roleFilter);
      const res = await fetch(`http://localhost:5000/api/admin/users?${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  const fetchHealth = useCallback(async () => {
    // removed
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/system/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setLogs((await res.json()).logs || []);
    } catch (e) {
      setLogs([]);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (e) {
      setAnalytics(null);
    }
  }, []);

  const fetchCoachApplications = useCallback(async () => {
    setAppLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/coach-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCoachApplications((await res.json()).applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAppLoading(false);
    }
  }, []);

  const handleApplication = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/admin/coach-applications/${userId}/${action}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      setAppMsg(data.message || data.error || 'Done');
      setTimeout(() => setAppMsg(''), 4000);
      fetchCoachApplications();
      fetchUsers(1);
    } catch (e) {
      setAppMsg('Network error');
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => { fetchUsers(pagination.page); }, [fetchUsers, pagination.page]);

  useEffect(() => { if (view === 'logs')               fetchLogs();               }, [view, fetchLogs]);
  useEffect(() => { if (view === 'analytics')          fetchAnalytics();          }, [view, fetchAnalytics]);
  useEffect(() => { if (view === 'coach-applications') fetchCoachApplications();  }, [view, fetchCoachApplications]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <button className={view === 'users' ? 'active' : ''} onClick={() => setView('users')}>
            <Users size={20} /> User Management
          </button>
          <button className={view === 'coach-applications' ? 'active' : ''} onClick={() => setView('coach-applications')}>
            <ClipboardList size={20} /> Coach Applications
          </button>
          <button className={view === 'coach-requests' ? 'active' : ''} onClick={() => setView('coach-requests')}>
            <UserCheck size={20} /> Coach Requests
          </button>
          <button className={view === 'coach-assignments' ? 'active' : ''} onClick={() => setView('coach-assignments')}>
            <UserCheck size={20} /> Coach Assignments
          </button>
          <button className={view === 'logs' ? 'active' : ''} onClick={() => setView('logs')}>
            <FileText size={20} /> System Logs
          </button>
          <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>
            <BarChart3 size={20} /> Analytics
          </button>
        </nav>

        {/* System Health widget removed */}
      </aside>

      <main className="admin-main">

        {/* ── User Management ── */}
        {view === 'users' && (
          <>
            <header className="admin-header">
              <h1>User Management</h1>
              <div className="filters">
                <label>Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                >
                  <option value="">All</option>
                  <option value="coach">Coach</option>
                  <option value="youth">Athlete (Youth)</option>
                  <option value="admin">Admin</option>
                  <option value="parent">Parent</option>
                </select>
                <ReportButton />
              </div>
            </header>
            <div className="admin-table-wrap">
              {loading ? <p>Loading users…</p> : (
                <>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                          <td>{u.email}</td>
                          <td><span className="role-badge">{u.role || '—'}</span></td>
                          <td>{u.last_login_at ? new Date(u.last_login_at.toString().replace(' ', 'T')).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="admin-pagination">
                    <button disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</button>
                    <span>Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} users)</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Coach Applications ── */}
        {view === 'coach-applications' && (
          <>
            <header className="admin-header">
              <h1>Coach Applications</h1>
              <p style={{ color: '#64748b', margin: 0 }}>
                Review and approve or reject coach account applications
              </p>
            </header>
            {appMsg && <div className="app-msg">{appMsg}</div>}
            {appLoading ? <p>Loading applications…</p>
              : coachApplications.length === 0 ? (
                <div className="empty-applications">
                  <p>✅ No pending coach applications.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Applied On</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {coachApplications.map((app) => (
                      <tr key={app.id}>
                        <td>{[app.first_name, app.last_name].filter(Boolean).join(' ') || '—'}</td>
                        <td>{app.email}</td>
                        <td>{new Date(app.created_at?.toString().replace(' ', 'T')).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-approve" onClick={() => handleApplication(app.id, 'approve')}>✓ Approve</button>
                            <button className="btn-reject"  onClick={() => handleApplication(app.id, 'reject')}>✕ Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </>
        )}

        {/* ── Coach Requests (youth requesting a coach) ── */}
        {view === 'coach-requests' && <AdminCoachRequests />}

        {/* ── Coach Assignments ── */}
        {view === 'coach-assignments' && <AdminCoachAssignments />}

        {/* ── System Logs ── */}
        {view === 'logs' && (
          <>
            <header className="admin-header"><h1>System Logs</h1></header>
            <div className="admin-logs">
              {logs.length === 0 ? <p>No activity found.</p> : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Event</th><th>User</th><th>Role</th><th>Description</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`log-badge log-${l.event_type}`}>
                            {l.event_type === 'registration' && '👤 Joined'}
                            {l.event_type === 'workout'      && '💪 Workout'}
                            {l.event_type === 'badge'        && '🏆 Badge'}
                            {l.event_type === 'wellness'     && '🌿 Wellness'}
                            {l.event_type === 'assignment'   && '🤝 Assigned'}
                          </span>
                        </td>
                        <td>
                          <span>{l.actor?.trim() || '—'}</span><br />
                          <small style={{ color: '#64748b' }}>{l.email}</small>
                        </td>
                        <td><span className="role-badge">{l.role || '—'}</span></td>
                        <td>{l.description}</td>
                        <td>{new Date(l.event_time?.toString().replace(' ', 'T')).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Analytics ── */}
        {view === 'analytics' && (
          <>
            <header className="admin-header"><h1>Analytics</h1></header>
            <div className="admin-analytics">
              {analytics ? (
                <>
                  <div className="analytics-cards">
                    <div className="analytics-card">
                      <span>Total workout logs</span>
                      <strong>{analytics.totalWorkoutLogs ?? 0}</strong>
                    </div>
                    <div className="analytics-card">
                      <span>Active wellness (7 days)</span>
                      <strong>{analytics.activeWellnessUsersLast7Days ?? 0}</strong>
                    </div>
                  </div>
                  <div className="analytics-by-role">
                    <h3>Users by role</h3>
                    <ul>
                      {(analytics.usersByRole || []).map((r) => (
                        <li key={r.role}><span className="role-badge">{r.role}</span> {r.count}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p>Loading analytics…</p>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
