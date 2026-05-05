/**
 * NotificationBell — shows unread count badge and a dropdown of notifications.
 * Placed in the Sidebar so every role sees it.
 * Polls every 30 seconds for new notifications.
 */

import { Bell, Check, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const API = 'http://localhost:5000';

// Icon per notification type
const typeIcon = {
  coach_request:     '🏋️',
  coach_application: '📋',
  coach_approved:    '✅',
  coach_rejected:    '❌',
  coach_assigned:    '🎉',
  new_message:       '💬',
  red_flag:          '🚨',
  wellness_streak:   '🔥',
  badge_earned:      '🏆',
};

const safeDate = (ts) => new Date(ts?.toString().replace(' ', 'T'));

function timeAgo(ts) {
  const d = safeDate(ts);
  if (isNaN(d)) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const token       = localStorage.getItem('token');

  const fetchCount = async () => {
    try {
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setUnread((await res.json()).count || 0);
    } catch {}
  };

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.notifications?.filter(n => !n.is_read).length || 0);
      }
    } catch {}
  };

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchCount();
    const t = setInterval(fetchCount, 30000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleOpen = () => {
    if (!open) fetchAll();
    setOpen(o => !o);
  };

  const markRead = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnread(u => Math.max(0, u - 1));
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(ns => ns.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(ns => ns.map(n => ({ ...n, is_read: 1 })));
    setUnread(0);
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      await fetch(`${API}/api/notifications/${n.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
      setUnread(u => Math.max(0, u - 1));
    }
    if (n.action_url) {
      navigate(n.action_url);
      setOpen(false);
    }
  };

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={toggleOpen} title="Notifications">
        <Bell size={22} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            <div className="notif-header-actions">
              {unread > 0 && (
                <button className="notif-mark-all" onClick={markAllRead} title="Mark all as read">
                  <Check size={14} /> All read
                </button>
              )}
              <button className="notif-close-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="notif-type-icon">{typeIcon[n.type] || '🔔'}</span>
                  <div className="notif-body">
                    <p className="notif-item-title">{n.title}</p>
                    <p className="notif-item-msg">{n.message}</p>
                    <span className="notif-time">{timeAgo(n.created_at)}</span>
                  </div>
                  <div className="notif-item-actions">
                    {!n.is_read && (
                      <button
                        className="notif-read-btn"
                        onClick={(e) => markRead(n.id, e)}
                        title="Mark as read"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      className="notif-del-btn"
                      onClick={(e) => deleteOne(n.id, e)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
