import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReminderNotification.css';

const ReminderNotification = () => {
  const [reminder, setReminder] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkExerciseReminder();
    // Check every 30 minutes
    const interval = setInterval(checkExerciseReminder, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkExerciseReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/reminders/check-exercise', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.needs_reminder && !showNotification) {
          setReminder({
            title: 'Time to Exercise!',
            message: "You haven't completed any workouts today. Stay active!",
            type: 'exercise'
          });
          setShowNotification(true);
          
          // Mark as sent
          await fetch('http://localhost:5000/api/reminders/mark-sent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
          });
        }
      }
    } catch (error) {
      console.error('Error checking reminder:', error);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setReminder(null);
  };

  const handleAction = () => {
    navigate('/fitness');
    setShowNotification(false);
  };

  if (!showNotification || !reminder) return null;

  return (
    <div className="reminder-notification">
      <div className="reminder-content">
        <Bell size={24} className="reminder-icon" />
        <div className="reminder-text">
          <h4>{reminder.title}</h4>
          <p>{reminder.message}</p>
        </div>
        <div className="reminder-actions">
          <button className="reminder-action-btn" onClick={handleAction}>
            Go to Fitness
          </button>
          <button className="reminder-dismiss-btn" onClick={handleDismiss}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderNotification;
