import { Award, Droplets, Dumbbell, LayoutDashboard, LogOut, Menu, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from '../Notification/NotificationBell';
import './Sidebar.css';

const menuConfig = {
  user: [
    { path: '/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
    { path: '/fitness',      label: 'Fitness',      icon: <Dumbbell size={20} /> },
    { path: '/wellness',     label: 'Wellness',     icon: <Droplets size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/profile',      label: 'Profile',      icon: <User size={20} /> }
  ],
  youth: [
    { path: '/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
    { path: '/fitness',      label: 'Fitness',      icon: <Dumbbell size={20} /> },
    { path: '/wellness',     label: 'Wellness',     icon: <Droplets size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/profile',      label: 'Profile',      icon: <User size={20} /> }
  ],
  parent: [
    { path: '/dashboard', label: 'Parent Dashboard', icon: <Users size={20} /> },
    { path: '/profile',   label: 'Profile',          icon: <User size={20} /> }
  ],
  coach: [
    { path: '/dashboard', label: 'Coach Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/profile',   label: 'Profile',         icon: <User size={20} /> }
  ],
  admin: [
    { path: '/dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/profile',   label: 'Profile',         icon: <User size={20} /> }
  ]
};

const Sidebar = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const currentMenu = menuConfig[role] || [];

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isCollapsed ? '' : 'active'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">AF</div>
          {!isCollapsed && <span>AFYAFIT</span>}
        </div>

        <nav className="sidebar-nav">
          {currentMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setIsCollapsed(true)}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-notif-row">
            <NotificationBell />
            {!isCollapsed && <span className="notif-label">Notifications</span>}
          </div>

          {role && !isCollapsed && (
            <div className="role-tag">{role.toUpperCase()} MODE</div>
          )}

          <button
            className="logout-btn"
            onClick={handleLogoutClick}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
