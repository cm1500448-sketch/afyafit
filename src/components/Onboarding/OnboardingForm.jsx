
// Import React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Import navigation hook for routing
import { useNavigate } from 'react-router-dom';
import './OnboardingForm.css';

/**
 * OnboardingForm Component
 * Collects initial profile information from new users
 */
const OnboardingForm = () => {
  const navigate = useNavigate(); // Initialize navigation function

   // Stores all input field values
  const [formData, setFormData] = useState({
    name: '',                      // User's full name
    age: '',                       // User's age
    height: '',                    // Height in cm
    weight: '',                    // Current weight in kg
    goal_weight: '',               // Target weight in kg
    fitness_level: 'Beginner'      // Fitness level (default: Beginner)
  });
  
  // Loading state for form submission
  const [loading, setLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already has profile data
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.height && data.weight && data.age) {
            // User already has profile, redirect to dashboard
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Profile check error:', err);
      }
    };
    checkProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          height: formData.height,
          weight: formData.weight,
          goal_weight: formData.goal_weight
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save profile');
      }

      // Update fitness level
      await fetch('http://localhost:5000/api/auth/update-level', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ level: formData.fitness_level })
      });

      localStorage.setItem('fitness_level', formData.fitness_level);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Welcome to AFYAFIT!</h1>
        <p className="onboarding-subtitle">Let's set up your profile to get started</p>

        {error && <div className="onboarding-error">{error}</div>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="10"
              max="25"
              placeholder="Your age"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm) *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                min="100"
                max="250"
                placeholder="e.g., 170"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Current Weight (kg) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                min="30"
                max="200"
                step="0.1"
                placeholder="e.g., 65"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goal_weight">Goal Weight (kg)</label>
            <input
              type="number"
              id="goal_weight"
              name="goal_weight"
              value={formData.goal_weight}
              onChange={handleChange}
              min="30"
              max="200"
              step="0.1"
              placeholder="Optional: e.g., 60"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fitness_level">Fitness Level *</label>
            <select
              id="fitness_level"
              name="fitness_level"
              value={formData.fitness_level}
              onChange={handleChange}
              required
            >
              <option value="Beginner">Beginner - Just starting out</option>
              <option value="Intermediate">Intermediate - Some experience</option>
              <option value="Advanced">Advanced - Regular exerciser</option>
            </select>
          </div>

          <button type="submit" className="onboarding-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
