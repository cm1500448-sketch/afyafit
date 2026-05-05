

// Import React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Import profile-specific styles
import './Profile.css';

// Import role-specific profile components
import AdminCoachParentProfile from './AdminCoachParentProfile';
import YouthProfile from './YouthProfile';

/**
 * Profile Component
 * Routes to appropriate profile view based on user role
 */
const Profile = () => {
  /**
   * User role state
   * Initialized from localStorage, then verified with backend
   * Determines which profile component to render
   */
  const [userRole, setUserRole] = useState(() => 
    localStorage.getItem('afyafit_role') || 'youth'
  );

  /**
   * Fetch and verify user role on component mount
   * Updates localStorage if role has changed
   */
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem('afyafit_role', data.role);
          }
        }
      } catch (err) {
        console.error("Role fetch error:", err);
      }
    };
    
    fetchRole();
  }, []);

  // Render youth-specific profile for youth and user roles
  if (userRole === 'youth' || userRole === 'user') {
    return <YouthProfile />;
  }

  // Render simplified profile for admin, coach, and parent roles
  return <AdminCoachParentProfile role={userRole} />;
};

// Export the component for use in routing
export default Profile;