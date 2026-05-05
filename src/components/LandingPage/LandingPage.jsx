// Import React Router's navigation hook to programmatically navigate between pages
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  // Initialize the navigate function to redirect users to different routes
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Top navigation bar with logo and action buttons */}
      <nav className="navbar">
        {/* Logo section*/}
        <div className="logo-container">
          <div className="logo-icon">AF</div>
          <span className="logo-text">AFYAFIT</span>
        </div>
        
        {/* Navigation menu with authentication buttons */}
        <div className="nav-menu">
          {/* Login button - for existing users */}
          <button className="btn-login" onClick={() => navigate('/auth')}>
            Login
          </button>
          {/* Primary CTA button - for new users to sign up */}
          <button className="btn-nav-primary" onClick={() => navigate('/auth')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Main promotional section - the first thing users see */}
      <section className="hero">
        {/* Badge - small attention-grabbing label above the main headline */}
        <div className="badge"> Your Fitness Journey Starts Here</div>
        
        {/* Main headline - the primary message to capture attention */}
        <h1 className="hero-title">
          Transform Your Life <br /> 
          with <span className="highlight">AFYAFIT</span>
        </h1>
        
        {/* Subheadline - explains the value proposition in more detail */}
        <p className="hero-description">
          The ultimate wellness companion for young adults. Track workouts, 
          monitor progress, and achieve your fitness goals with our all-in-one platform.
        </p>
        
        {/* Call-to-action buttons - primary conversion points */}
        <div className="hero-btns">
          {/* Primary CTA - main action we want users to take */}
          <button className="btn-main" onClick={() => navigate('/auth')}>
            Get Started →
          </button>
          
          {/* Secondary CTA - for users who already have an account */}
          <button className="btn-alt" onClick={() => navigate('/auth')}>
            I Have an Account
          </button>
        </div>
      </section>

      {/* Displays impressive numbers to build credibility and trust */}
      <section className="stats-grid">
        {/* Each stat card shows a key metric about the platform */}
        <div className="stat-card">
          <div className="stat-value">10K+</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">500+</div>
          <div className="stat-label">Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">95%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Support</div>
        </div>
      </section>

      {/* Showcases the main features and benefits of the platform */}
      <section className="features-section">
        {/* Section header with title and description */}
        <div className="section-header">
          <h2>Everything You Need to <span className="highlight">Succeed</span></h2>
          <p>Comprehensive tools designed specifically for young adults to build healthy habits.</p>
        </div>
        
        {/* Grid of feature cards - each highlighting a key benefit */}
        <div className="features-grid">
          <FeatureCard 
            title="Personalized Workouts" 
            desc="Custom workout plans designed for your fitness level and goals." 
          />
          <FeatureCard
            title="Wellness Tracking" 
            desc="Monitor sleep, nutrition, and mental wellness in one place." 
          />
          <FeatureCard 
            title="Progress Analytics" 
            desc="Visual charts and insights to keep you motivated and on track." 
          />
          <FeatureCard 
            title="Community Support" 
            desc="Connect with peers on the same fitness journey as you." 
          />
        </div>
      </section>

      {/* Final conversion section - encourages users to sign up */}
      <section className="cta-banner-section">
        <div className="cta-card">
          <div className="cta-content">
            {/* Star rating - social proof element */}
            <div className="stars">★★★★★</div>
            
            {/* CTA headline - creates urgency and excitement */}
            <h2>Ready to Start Your Transformation?</h2>
            
            {/* Supporting text - reinforces the value proposition */}
            <p>Join thousands of young adults who are already achieving their fitness goals. Start your free trial today!</p>
            
            {/* Final CTA button - last chance to convert */}
            <button 
              className="btn-cta-free" 
              onClick={() => navigate('/auth')}
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      {/* Bottom section with legal and security information */}
      <footer className="footer">
        {/* Left side - security badge to build trust */}
        <div className="footer-left">
          <span className="security-note">Your data is safe and secure</span>
        </div>
        
        {/* Right side - copyright notice */}
        <div className="footer-right">
          <span>© 2026 AFYAFIT. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    {/* Icon container - visual representation of the feature */}
    <div className="feature-icon-box">
      <span className="feature-icon">{icon}</span>
    </div>
    
    {/* Feature title */}
    <h3>{title}</h3>
    
    {/* Feature description */}
    <p>{desc}</p>
  </div>
);

// Export the component so it can be used in other parts of the application
export default LandingPage;