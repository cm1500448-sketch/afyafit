
// Import icons for UI elements
import { Download, FileText, Users } from 'lucide-react';

// Import React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Import parent dashboard-specific styles
import './ParentDashboard.css';

// Import ReportButton component
import ReportButton from '../Reports/ReportButton';

/**
 * ParentDashboard Component
 * Main dashboard for parents to monitor their children
 */
const ParentDashboard = () => {
  // ========== STATE MANAGEMENT ==========
  
  // List of linked youth/children
  const [youthList, setYouthList] = useState([]);
  
  // Currently selected youth for detailed view
  const [selectedYouth, setSelectedYouth] = useState(null);
  
  // Report data for selected youth
  const [reportData, setReportData] = useState(null);
  
  // Loading state for data fetching
  const [loading, setLoading] = useState(true);
  
  // Verification code for linking youth account
  const [verificationCode, setVerificationCode] = useState('');
  
  // Parent's email (for notifications)
  const [parentEmail, setParentEmail] = useState('');
  
  // Toggle for showing link form
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    fetchYouthList();
  }, []);

  const fetchYouthList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/parent/youth-list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setYouthList(data);
      }
    } catch (error) {
      console.error('Error fetching youth list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkYouth = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/parent/link-youth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verification_code: verificationCode })
      });

      if (res.ok) {
        const { showNotification } = await import('../../utils/notification');
        showNotification('Youth account linked successfully!', 'success');
        setVerificationCode('');
        setShowLinkForm(false);
        fetchYouthList();
      } else {
        const error = await res.json();
        const { showNotification } = await import('../../utils/notification');
        showNotification(error.error || 'Failed to link youth account', 'error');
      }
    } catch (error) {
      console.error('Error linking youth:', error);
      const { showNotification } = await import('../../utils/notification');
      showNotification('Failed to link youth account', 'error');
    }
  };

  const [reportLoading, setReportLoading] = useState(false);

  const fetchReport = async (youthId, days = 30) => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch(
        `http://localhost:5000/api/parent/youth-report/${youthId}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setSelectedYouth(youthId);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Report fetch failed:', err.error || res.statusText);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    const wellness = reportData.wellness || [];
    const workouts = reportData.workouts || [];
    const meals = reportData.meals || [];
    const badges = reportData.badges || [];

    const youth = youthList.find(y => y.id === selectedYouth);
    const youthName = youth ? `${youth.first_name} ${youth.last_name}` : 'Youth';

    // Create CSV content
    let csvContent = `Youth Activity Report: ${youthName}\n`;
    csvContent += `Period: ${reportData.period.start} to ${reportData.period.end}\n\n`;

    // Wellness Data
    csvContent += `Wellness Data\n`;
    csvContent += `Date,Water (cups),Sleep (hours),Mood Score\n`;
    wellness.forEach(day => {
      const waterCups = Math.floor((day.water_ml || 0) / 250);
      csvContent += `${day.log_date},${waterCups},${day.sleep_hours || 0},${day.mood_score || 0}\n`;
    });

    csvContent += `\nWorkout Data\n`;
    csvContent += `Date,Workout Count,Total Minutes\n`;
    workouts.forEach(day => {
      csvContent += `${day.workout_date},${day.workout_count || 0},${day.total_minutes || 0}\n`;
    });

    csvContent += `\nMeal Data\n`;
    csvContent += `Date,Total Calories,Meal Count\n`;
    meals.forEach(day => {
      csvContent += `${day.meal_date},${day.total_calories || 0},${day.meal_count || 0}\n`;
    });

    csvContent += `\nBadges Earned\n`;
    csvContent += `Name,Description,Earned Date\n`;
    badges.forEach(badge => {
      csvContent += `${badge.name},${badge.description || ''},${badge.earned_at}\n`;
    });

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youth-report-${youthName.replace(/\s+/g, '-')}-${reportData.period.start}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="parent-dashboard">
      <header className="parent-header">
        <h1>Parent Dashboard</h1>
        <p>Monitor your youth's fitness and wellness activities</p>
      </header>

      <div className="parent-content">
        {/* Link New Youth Section */}
        <div className="link-youth-section">
          <button 
            className="link-youth-btn"
            onClick={() => setShowLinkForm(!showLinkForm)}
          >
            <Users size={20} />
            Link New Youth Account
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
              <button type="submit">Link Account</button>
            </form>
          )}
        </div>

        {/* Youth List */}
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
                    <button 
                      className="view-report-btn"
                      onClick={() => fetchReport(youth.id)}
                    >
                      <FileText size={18} />
                      View Report
                    </button>
                    <ReportButton 
                      userId={youth.id} 
                      userName={`${youth.first_name} ${youth.last_name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Section */}
        {reportData && selectedYouth && (
          <div className="report-section">
            <div className="report-header">
              <h2>
                Activity Report: {youthList.find(y => y.id === selectedYouth)?.first_name || 'Youth'}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="download-btn" 
                  onClick={() => fetchReport(selectedYouth)}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Refreshing…' : 'Refresh Report'}
                </button>
                <button className="download-btn" onClick={downloadReport}>
                  <Download size={18} />
                  Download Report
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
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Water (cups)</th>
                        <th>Sleep (hrs)</th>
                        <th>Mood</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.wellness || []).length === 0 ? (
                        <tr><td colSpan={4} style={{ color: '#64748b' }}>No wellness data in this period. Youth can log water, sleep, and mood from the Wellness page.</td></tr>
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
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Workouts</th>
                        <th>Total Minutes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.workouts || []).length === 0 ? (
                        <tr><td colSpan={3} style={{ color: '#64748b' }}>No workouts in this period. Youth can log workouts from the Fitness page.</td></tr>
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
