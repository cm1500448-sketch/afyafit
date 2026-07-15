import { useState } from 'react';
import './CoachRequestForm.css';

const CoachRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    reason: '',
    goals: '',
    preferred_style: '',
    special_requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    if (formData.goals.trim().length < 10) {
      setError('Goals must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/coach-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      if (onSuccess) {
        onSuccess(data.request);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-request-form-container">
      <div className="form-header">
        <h2>Request a Coach</h2>
        <p>Tell us about your fitness goals and we'll match you with a coach</p>
      </div>

      <form onSubmit={handleSubmit} className="coach-request-form">
        <div className="form-group">
          <label htmlFor="reason">
            Why do you want a coach? <span className="required">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="4"
            placeholder="I want to improve my fitness and need guidance..."
            className="form-textarea"
          />
          <small className="form-hint">
            Minimum 10 characters ({formData.reason.length}/10)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="goals">
            What are your fitness goals? <span className="required">*</span>
          </label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Lose 10kg, build muscle strength, improve endurance..."
            className="form-textarea"
          />
          <small className="form-hint">
            Minimum 10 characters ({formData.goals.length}/10)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="preferred_style">
            Preferred Coaching Style <span className="optional">(optional)</span>
          </label>
          <input
            type="text"
            id="preferred_style"
            name="preferred_style"
            value={formData.preferred_style}
            onChange={handleChange}
            placeholder="Motivational, strict, supportive..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="special_requirements">
            Special Requirements <span className="optional">(optional)</span>
          </label>
          <textarea
            id="special_requirements"
            name="special_requirements"
            value={formData.special_requirements}
            onChange={handleChange}
            rows="3"
            placeholder="Any injuries, dietary restrictions, or special needs..."
            className="form-textarea"
          />
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
          className="btn-submit"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Submitting Request...
            </>
          ) : (
            <>
              Submit Coach Request
            </>
          )}
        </button>
      </form>

      <div className="info-box">
        <h3>What happens next?</h3>
        <ol>
          <li>Your request will be reviewed by our admin team</li>
          <li>We'll match you with a suitable coach based on your goals</li>
          <li>You'll be notified once a coach is assigned</li>
          <li>Your coach will reach out to start your fitness journey</li>
        </ol>
      </div>
    </div>
  );
};

export default CoachRequestForm;
