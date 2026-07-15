import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';

import Auth from './components/Auth/Auth.jsx';
import ResetPasswordPage from './components/Auth/components/ResetPasswordPage.jsx';
import LandingPage from './components/LandingPage/LandingPage.jsx';

import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import CoachDashboard from './components/Coach/CoachDashboard.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import ParentDashboard from './components/Parent/ParentDashboard.jsx';

import Achievements from './components/Achievements/Achievements.jsx';
import CoachUserDetail from './components/Coach/CoachUserDetail.jsx';
import Fitness from './components/Fitness/Fitness.jsx';
import OnboardingForm from './components/Onboarding/OnboardingForm.jsx';
import Profile from './components/Profile/Profile.jsx';
import ReportGenerator from './components/Reports/ReportGenerator.jsx';
import Wellness from './components/Wellness/Wellness.jsx';

import ReminderNotification from './components/Reminders/ReminderNotification.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';

const LayoutWrapper = ({ children, userRole, handleLogout, isAuthenticated }) => {
  const location = useLocation();
  const publicPaths = ['/', '/auth', '/reset-password'];
  const showSidebar = !publicPaths.includes(location.pathname) && isAuthenticated;

  return (
    <div className={showSidebar ? 'dashboard-container' : 'auth-wrapper'}>
      {showSidebar && <Sidebar role={userRole} onLogout={handleLogout} />}
      <main className={showSidebar ? 'dashboard-main' : 'auth-content'}>
        {children}
      </main>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('afyafit_role');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(storedRole || 'user');
    }
  }, []);

  const handleLoginSuccess = (userData, role) => {
    setIsAuthenticated(true);
    setUserRole(role || 'user');
    localStorage.setItem('afyafit_role', role || 'user');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <Router>
      {isAuthenticated && <ReminderNotification />}
      <LayoutWrapper
        userRole={userRole}
        handleLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      >
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              !isAuthenticated ? <Navigate to="/auth" /> :
              userRole === 'admin'  ? <AdminDashboard /> :
              userRole === 'coach'  ? <CoachDashboard /> :
              userRole === 'parent' ? <ParentDashboard /> :
                                      <Dashboard />
            }
          />

          <Route path="/wellness"      element={isAuthenticated ? <Wellness />       : <Navigate to="/auth" />} />
          <Route path="/fitness"       element={isAuthenticated ? <Fitness />        : <Navigate to="/auth" />} />
          <Route path="/achievements"  element={isAuthenticated ? <Achievements />   : <Navigate to="/auth" />} />
          <Route path="/profile"       element={isAuthenticated ? <Profile />        : <Navigate to="/auth" />} />
          <Route path="/reports"       element={isAuthenticated ? <ReportGenerator /> : <Navigate to="/auth" />} />

          <Route
            path="/coach/user/:userId"
            element={isAuthenticated && userRole === 'coach' ? <CoachUserDetail /> : <Navigate to="/auth" />}
          />

          <Route
            path="/onboarding"
            element={
              isAuthenticated && (userRole === 'youth' || userRole === 'user')
                ? <OnboardingForm />
                : <Navigate to="/dashboard" />
            }
          />

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth'} />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
