import { Download, FileText, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReportButton from '../Reports/ReportButton';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const [youthList, setYouthList] = useState([]);
  const [selectedYouth, setSelectedYouth] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    fetchYouthList();
  }, []);

  const fetchYouthList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/parent/youth-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setYouthList(await res.json());
    } catch (error) {
      console.error('Error fetching youth list:', error);
    } finally {
      setLoading(false);
    }
  };

  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  const handleLinkYouth = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!verificationCode.trim()) {
      setLinkError('Please enter a verification code.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/parent/link-youth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verification_code: verificationCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setLinkSuccess('Youth account linked successfully!');
        setVerificationCode('');
        setTimeout(() => { setShowLinkForm(false); setLinkSuccess(''); }, 2000);
        fetchYouthList();
      } else {
        setLinkError(data.error || 'Failed to link youth account. Check the code and try again.');
      }
    } catch (error) {
      setLinkError('Network error. Make sure the server is running.');
      console.error('Error linking youth:', error);
    }
  };

  const fetchReport = async (youthId, days = 30) => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await fetch(`http://localhost:5000/api/parent/youth-report/${youthId}?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReportData(await res.json());
        setSelectedYouth(youthId);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    const youth = youthList.find(y => y.id === selectedYouth);
    const youthName = youth ? `${youth.first_name} ${youth.last_name}` : 'Youth';

    let csv = `Youth Activity Report: ${youthName}\n`;
    csv += `Period: ${reportData.period.start} to ${reportData.period.end}\n\n`;
    csv += `Wellness Data\nDate,Water (cups),Sleep (hours),Mood Score\n`;
    (reportData.wellness || []).forEach(d => { csv += `${d.log_date},${Math.floor((d.water_ml || 0) / 250)},${d.sleep_hours || 0},${d.mood_score || 0}\n`; });
    csv += `\nWorkout Data\nDate,Workout Count,Total Minutes\n`;
    (reportData.workouts || []).forEach(d => { csv += `${d.workout_date},${d.workout_count || 0},${d.total_minutes || 0}\n`; });
    csv += `\nMeal Data\nDate,Total Calories,Meal Count\n`;
    (reportData.meals || []).forEach(d => { csv += `${d.meal_date},${d.total_calories || 0},${d.meal_count || 0}\n`; });
    csv += `\nBadges Earned\nName,Description,Earned Date\n`;
    (reportData.badges || []).forEach(b => { csv += `${b.name},${b.description || ''},${b.earned_at}\n`; });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youth-report-${youthName.replace(/\s+/g, '-')}-${reportData.period.start}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="parent-dashboard">
      <header className="parent-header">
        <h1>Parent Dashboard</h1>
        <p>Monitor your youth's fitness and wellness activities</p>
      </header>

      <div className="parent-content">
        <div className="link-youth-section">
          <button className="link-youth-btn" onClick={() => setShowLinkForm(!showLinkForm)}>
            <Users size={20} /> Link New Youth Account
          </button>
          {showLinkForm && (
            <form className="link-form" onSubmit={handleLinkYouth}>
              <input
                type="text"
                placeholder="Enter verification code from youth"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                required
              />
              {linkError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{linkError}</p>}
              {linkSuccess && <p style={{ color: '#22c55e', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{linkSuccess}</p>}
              <button type="submit">Link Account</button>
            </form>
          )}
        </div>

        <div className="youth-list-section">
          <h2>Linked Youth Accounts</h2>
          {youthList.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No youth accounts linked yet.</p>
              <p>Ask your youth to generate a verification code from their profile.</p>
            </div>
          ) : (
            <div className="youth-grid">
              {youthList.map((youth) => (
                <div key={youth.id} className="youth-card">
                  <div className="youth-info">
                    <h3>{youth.first_name} {youth.last_name}</h3>
                    <p>{youth.email}</p>
                    <p className="linked-date">Linked: {new Date(youth.linked_at).toLocaleDateString()}</p>
                  </div>
                  <div className="youth-actions">
                    <button className="view-report-btn" onClick={() => fetchReport(youth.id)}>
                      <FileText size={18} /> View Report
                    </button>
                    <ReportButton userId={youth.id} userName={`${youth.first_name} ${youth.last_name}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {reportData && selectedYouth && (
          <div className="report-section">
            <div className="report-header">
              <h2>Activity Report: {youthList.find(y => y.id === selectedYouth)?.first_name || 'Youth'}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="download-btn" onClick={() => fetchReport(selectedYouth)} disabled={reportLoading}>
                  {reportLoading ? 'Refreshing…' : 'Refresh Report'}
                </button>
                <button className="download-btn" onClick={downloadReport}>
                  <Download size={18} /> Download Report
                </button>
              </div>
            </div>

            <div className="report-stats">
              <div className="stat-box">
                <h3>Total Workouts</h3>
                <p className="stat-value">{(reportData.workouts || []).reduce((sum, w) => sum + (w.workout_count || 0), 0)}</p>
              </div>
              <div className="stat-box">
                <h3>Badges Earned</h3>
                <p className="stat-value">{(reportData.badges || []).length}</p>
              </div>
            </div>

            <div className="report-details">
              <div className="detail-section">
                <h3>Recent Wellness Activity</h3>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Water (cups)</th><th>Sleep (hrs)</th><th>Mood</th></tr></thead>
                    <tbody>
                      {(reportData.wellness || []).length === 0 ? (
                        <tr><td colSpan={4} style={{ color: '#64748b' }}>No wellness data in this period.</td></tr>
                      ) : (reportData.wellness || []).slice(0, 7).map((day, idx) => (
                        <tr key={idx}>
                          <td>{new Date(day.log_date).toLocaleDateString()}</td>
                          <td>{Math.floor((day.water_ml || 0) / 250)}</td>
                          <td>{day.sleep_hours ?? '—'}</td>
                          <td>{day.mood_score ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-section">
                <h3>Recent Workouts</h3>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Workouts</th><th>Total Minutes</th></tr></thead>
                    <tbody>
                      {(reportData.workouts || []).length === 0 ? (
                        <tr><td colSpan={3} style={{ color: '#64748b' }}>No workouts in this period.</td></tr>
                      ) : (reportData.workouts || []).slice(0, 7).map((day, idx) => (
                        <tr key={idx}>
                          <td>{new Date(day.workout_date).toLocaleDateString()}</td>
                          <td>{day.workout_count || 0}</td>
                          <td>{day.total_minutes || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
