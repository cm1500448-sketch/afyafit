

// Import icons for navigation items
import { Award, Droplets, Dumbbell, LayoutDashboard, LogOut, Menu, User, Users, X } from 'lucide-react';

// Import React Router components for navigation
import { NavLink, useNavigate } from 'react-router-dom';

// Import React hooks
import { useState } from 'react';

// Import notification bell
import NotificationBell from '../Notification/NotificationBell';

// Import sidebar-specific styles
import './Sidebar.css';

/**
 * Sidebar Component
 * 
 * @param {string} role - Current user's role (youth, parent, coach, admin)
 * @param {function} onLogout - Callback function to handle logout
 */
const Sidebar = ({ role, onLogout }) => {
  // Initialize navigation function
  const navigate = useNavigate();
  
  // State to track if sidebar is collapsed (mobile-friendly)
  const [isCollapsed, setIsCollapsed] = useState(true);

  /**
   * Menu Configuration Object
   * Defines navigation items for each user role
   * Each menu item has: path (route), label (display text), icon (visual indicator)
   */
  const menuConfig = {
    // Regular user menu (same as youth)
    user: [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/fitness', label: 'Fitness', icon: <Dumbbell size={20} /> },
      { path: '/wellness', label: 'Wellness', icon: <Droplets size={20} /> },
      { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
      { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    
    // Youth user menu (full access to fitness features)
    youth: [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/fitness', label: 'Fitness', icon: <Dumbbell size={20} /> },
      { path: '/wellness', label: 'Wellness', icon: <Droplets size={20} /> },
      { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
      { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    
    // Parent menu (monitoring and profile only)
    parent: [
      { path: '/dashboard', label: 'Parent Dashboard', icon: <Users size={20} /> },
      { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    
    // Coach menu (client management and profile)
    coach: [
      { path: '/dashboard', label: 'Coach Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    
    // Admin menu (system management and profile)
    admin: [
      { path: '/dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    ]
  };

  // Get the appropriate menu for the current user's role
  const currentMenu = menuConfig[role] || [];

  /**
   * Handle logout button click
   * Calls the parent's logout function and redirects to home
   */
  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile toggle button - shows/hides sidebar on small screens */}
      <button 
        className={`sidebar-toggle ${isCollapsed ? '' : 'active'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle sidebar"
      >
        {/* Show Menu icon when collapsed, X icon when expanded */}
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>
      
      {/* Main sidebar container */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand/Logo section at top of sidebar */}
        <div className="sidebar-brand">
          <div className="brand-icon">AF</div>
          {/* Show full brand name only when sidebar is expanded */}
          {!isCollapsed && <span>AFYAFIT</span>}
        </div>

      {/* Navigation links section */}
      <nav className="sidebar-nav">
        {/* Map through menu items for current role */}
        {currentMenu.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            // NavLink automatically adds 'active' class to current route
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            // Collapse sidebar after clicking a link (mobile UX)
            onClick={() => setIsCollapsed(true)}
          >
            {/* Icon for the menu item */}
            {item.icon}
            {/* Show label text only when sidebar is expanded */}
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer section with role badge and logout button */}
      <div className="sidebar-footer">
        {/* Notification bell — visible to all roles */}
        <div className="sidebar-notif-row">
          <NotificationBell />
          {!isCollapsed && <span className="notif-label">Notifications</span>}
        </div>

        {/* Display current role badge (only when expanded) */}
        {role && !isCollapsed && (
          <div className="role-tag">
            {role.toUpperCase()} MODE
          </div>
        )}
        
        {/* Logout button */}
        <button 
          className="logout-btn" 
          onClick={handleLogoutClick} 
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          {/* Show "Logout" text only when sidebar is expanded */}
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

// Export the component for use in the application
export default Sidebar;