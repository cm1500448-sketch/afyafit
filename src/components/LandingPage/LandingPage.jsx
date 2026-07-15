import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo-icon">AF</div>
          <span className="logo-text">AFYAFIT</span>
        </div>
        <div className="nav-menu">
          <button className="btn-login" onClick={() => navigate('/auth')}>Login</button>
          <button className="btn-nav-primary" onClick={() => navigate('/auth')}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <div className="badge">Your Fitness Journey Starts Here</div>
        <h1 className="hero-title">
          Transform Your Life <br />
          with <span className="highlight">AFYAFIT</span>
        </h1>
        <p className="hero-description">
          The ultimate wellness companion for young adults. Track workouts,
          monitor progress, and achieve your fitness goals with our all-in-one platform.
        </p>
        <div className="hero-btns">
          <button className="btn-main" onClick={() => navigate('/auth')}>Get Started →</button>
          <button className="btn-alt" onClick={() => navigate('/auth')}>I Have an Account</button>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need to <span className="highlight">Succeed</span></h2>
          <p>Comprehensive tools designed specifically for young adults to build healthy habits.</p>
        </div>
        <div className="features-grid">
          <FeatureCard title="Personalized Workouts" desc="Custom workout plans designed for your fitness level and goals." />
          <FeatureCard title="Wellness Tracking" desc="Monitor sleep, nutrition, and mental wellness in one place." />
          <FeatureCard title="Progress Analytics" desc="Visual charts and insights to keep you motivated and on track." />
          <FeatureCard title="Community Support" desc="Connect with peers on the same fitness journey as you." />
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon-box">
      <span className="feature-icon">{icon}</span>
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default LandingPage;
