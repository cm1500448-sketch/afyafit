import { useEffect, useState } from 'react';
import './Profile.css';
import AdminCoachParentProfile from './AdminCoachParentProfile';
import YouthProfile from './YouthProfile';

const Profile = () => {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('afyafit_role') || 'youth');

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem('afyafit_role', data.role);
          }
        }
      } catch (err) {
        console.error('Role fetch error:', err);
      }
    };
    fetchRole();
  }, []);

  if (userRole === 'youth' || userRole === 'user') {
    return <YouthProfile />;
  }

  return <AdminCoachParentProfile role={userRole} />;
};

export default Profile;
