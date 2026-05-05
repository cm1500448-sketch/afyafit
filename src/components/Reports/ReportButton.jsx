import { useState } from 'react';

const ReportButton = ({ userId = null, userName = 'Your' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuickReport = async () => {
    setError('');
    setLoading(true);

    try {
      // Default to last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId || undefined,
          startDate,
          endDate,
          includeCharts: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AfyaFit-Report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-button-container">
      <button
        onClick={generateQuickReport}
        disabled={loading}
        className="report-button"
        title={`Generate ${userName} 30-day report`}
      >
        {loading ? (
          <>
            <span className="spinner-small"></span>
            Generating...
          </>
        ) : (
          <>
            <span className="icon">📄</span>
            Generate Report
          </>
        )}
      </button>
      {error && (
        <div className="report-error-toast">
          {error}
        </div>
      )}
      <style>{`
        .report-button-container {
          position: relative;
        }

        .report-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .report-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .report-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .report-button .icon {
          font-size: 1.1rem;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .report-error-toast {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          border-radius: 6px;
          font-size: 0.85rem;
          z-index: 1000;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ReportButton;
