import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';

import Auth from './components/Auth/Auth.jsx';
import LandingPage from './components/LandingPage/LandingPage.jsx';

// Dashboard components for different user roles
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import CoachDashboard from './components/Coach/CoachDashboard.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx'; // Youth/User dashboard
import ParentDashboard from './components/Parent/ParentDashboard.jsx';

// Core feature components
import Achievements from './components/Achievements/Achievements.jsx';
import CoachUserDetail from './components/Coach/CoachUserDetail.jsx';
import Fitness from './components/Fitness/Fitness.jsx';
import OnboardingForm from './components/Onboarding/OnboardingForm.jsx';
import Profile from './components/Profile/Profile.jsx';
import ReportGenerator from './components/Reports/ReportGenerator.jsx';
import Wellness from './components/Wellness/Wellness.jsx';

// Shared UI components
import ReminderNotification from './components/Reminders/ReminderNotification.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';

const LayoutWrapper = ({ children, userRole, handleLogout, isAuthenticated }) => {
  const location = useLocation();
  const isPublicPath = location.pathname === '/' || location.pathname === '/auth';
  const showSidebar = !isPublicPath && isAuthenticated;

  return (
    <div className={!showSidebar ? "auth-wrapper" : "dashboard-container"}>
      {showSidebar && <Sidebar role={userRole} onLogout={handleLogout} />}
      <main className={!showSidebar ? "auth-content" : "dashboard-main"}>
        {children}
      </main>
    </div>
  );
};

/**
 * Main App Component
 * 
 * This is the root component that manages the entire application state and routing.
 * It handles authentication, user roles, and navigation between different pages.
 */
function App() {
  // ========== STATE MANAGEMENT ==========
  
  /**
   * Authentication state - tracks if user is logged in
   * @type {boolean}
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /**
   * User role state - stores the current user's role
   * Possible values: 'admin', 'coach', 'parent', 'youth', 'user'
   * @type {string|null}
   */
  const [userRole, setUserRole] = useState(null);

  /**
   * Initialize auth state from localStorage on app mount.
   * Prevents users from automatically logging out on a page refresh.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('afyafit_role');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(storedRole || 'user');
    }
  }, []);

  // ========== EVENT HANDLERS ==========
  
  /**
   * Handle successful login
   * Called by the Auth component when user successfully logs in
   * 
   * @param {Object} userData - User information from the backend
   * @param {string} role - User's role (admin, coach, parent, youth)
   */
  const handleLoginSuccess = (userData, role) => {
    // Update authentication state
    setIsAuthenticated(true);
    
    // Set user role (default to 'user' if not provided)
    setUserRole(role || 'user');
    
    // Store role in localStorage for persistence across page refreshes
    localStorage.setItem('afyafit_role', role || 'user');
    
    // Note: User data is stored in the database, we only keep the token in localStorage
  };

  /**
   * Handle user logout
   * Clears all authentication state and redirects to auth page
   */
  const handleLogout = () => {
    // Clear authentication state
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Clear all data from localStorage
    localStorage.clear();
    
    // Redirect to authentication page
    window.location.href = "/auth";
  };

  // ========== RENDER ==========
  return (
    <Router>
      {/* Show reminder notifications only for authenticated users */}
      {isAuthenticated && <ReminderNotification />}
      
      {/* Wrap all routes in the layout wrapper for consistent structure */}
      <LayoutWrapper 
        userRole={userRole} 
        handleLogout={handleLogout} 
        isAuthenticated={isAuthenticated}
      >
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          
          {/* Landing page - accessible to everyone */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication page (login/signup) */}
          {/* Redirects to dashboard if already authenticated */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Auth onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* ========== PROTECTED ROUTES ========== */}
          {/* These routes require authentication and redirect to /auth if not logged in */}
          
          {/* Main Dashboard - shows different dashboard based on user role */}
          <Route 
            path="/dashboard" 
            element={
              !isAuthenticated ? 
                <Navigate to="/auth" /> : 
              userRole === 'admin' ? 
                <AdminDashboard /> :
              userRole === 'coach' ? 
                <CoachDashboard /> :
              userRole === 'parent' ? 
                <ParentDashboard /> : 
                <Dashboard /> // Default dashboard for youth/user
            } 
          />

          {/* Wellness tracking page - sleep, nutrition, mental health */}
          <Route 
            path="/wellness" 
            element={
              isAuthenticated ? 
                <Wellness /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* Fitness page - workouts and exercise tracking */}
          <Route 
            path="/fitness" 
            element={
              isAuthenticated ? 
                <Fitness /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* Achievements page - badges, points, and streaks */}
          <Route 
            path="/achievements" 
            element={
              isAuthenticated ? 
                <Achievements /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* User profile page - view and edit profile information */}
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
                <Profile /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* Reports page - generate PDF wellness reports */}
          <Route 
            path="/reports" 
            element={
              isAuthenticated ? 
                <ReportGenerator /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* Coach user detail page - view detailed user information */}
          <Route 
            path="/coach/user/:userId" 
            element={
              isAuthenticated && userRole === 'coach' ? 
                <CoachUserDetail /> : 
                <Navigate to="/auth" />
            } 
          />

          {/* Onboarding form - only for youth/user roles */}
          {/* Helps new users set up their fitness profile */}
          <Route 
            path="/onboarding" 
            element={
              isAuthenticated && (userRole === 'youth' || userRole === 'user') ? 
                <OnboardingForm /> : 
                <Navigate to="/dashboard" />
            } 
          />

          {/* Catch-all route - redirects to appropriate page */}
          {/* Authenticated users go to dashboard, others go to auth */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />
            } 
          />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

// Export the App component as the default export
export default App;