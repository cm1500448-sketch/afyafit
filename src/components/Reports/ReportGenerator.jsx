import { useState, useEffect } from 'react';
import './ReportGenerator.css';

const ReportGenerator = () => {
  const [formData, setFormData] = useState({
    userId: '',
    startDate: '',
    endDate: '',
    includeCharts: false
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role || 'youth');
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, startDate, endDate }));

    if (['parent', 'coach', 'admin'].includes(payload.role)) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';

      if (userRole === 'parent') {
        endpoint = '/api/parent/children';
      } else if (userRole === 'coach') {
        endpoint = '/api/coach/assigned-users';
      } else if (userRole === 'admin') {
        endpoint = '/api/admin/users';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data.children || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AfyaFit-Report-${formData.startDate}-to-${formData.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const { showNotification } = await import('../../utils/notification');
      showNotification('Report generated successfully!', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <div className="report-generator-header">
        <h2>Generate Wellness Report</h2>
        <p>Create a comprehensive PDF report of wellness and fitness data</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {['parent', 'coach', 'admin'].includes(userRole) && users.length > 0 && (
          <div className="form-group">
            <label htmlFor="userId">Select User</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">My Own Report</option>
              {users.map(user => (
                <option key={user.id || user.user_id} value={user.id || user.user_id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <small className="form-text">Leave empty to generate your own report</small>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeCharts"
              checked={formData.includeCharts}
              onChange={handleChange}
            />
            <span>Include charts and graphs (coming soon)</span>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠ </span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-generate"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating Report...
            </>
          ) : (
            <>
              <span className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              Generate PDF Report
            </>
          )}
        </button>
      </form>

      <div className="report-info">
        <h3>What's Included in Your Report?</h3>
        <ul>
          <li>Wellness Summary (sleep, water, mood)</li>
          <li>Nutrition Summary (calories, meals)</li>
          <li>Fitness Summary (workouts, duration)</li>
          <li>Progress Metrics (weight, BMI changes)</li>
          <li>Achievements (badges earned)</li>
          <li>Gamification Stats (points)</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportGenerator;
