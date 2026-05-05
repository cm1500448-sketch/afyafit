import { useState, useEffect, useRef } from 'react';

const MetricCard = ({ label, value, unit, progress, onClick, showSync, onSync, showStepTracker, onStepsUpdate }) => {
  const [tracking, setTracking] = useState(false);
  const [liveSteps, setLiveSteps] = useState(value || 0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const stepCountRef = useRef(value || 0);
  const lastAccelRef = useRef(null);
  const listenerRef = useRef(null);

  // Keep liveSteps in sync with incoming value when not tracking
  useEffect(() => {
    if (!tracking) {
      setLiveSteps(value || 0);
      stepCountRef.current = value || 0;
    }
  }, [value, tracking]);

  const detectStep = (event) => {
    const { x, y, z } = event.accelerationIncludingGravity || event.acceleration || {};
    if (x == null || y == null || z == null) return;

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const last = lastAccelRef.current;

    if (last !== null) {
      const delta = Math.abs(magnitude - last);
      // Step threshold — tuned for walking motion
      if (delta > 3.5) {
        stepCountRef.current += 1;
        setLiveSteps(stepCountRef.current);
      }
    }
    lastAccelRef.current = magnitude;
  };

  const startTracking = async () => {
    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') {
          setPermissionDenied(true);
          return;
        }
      } catch {
        setPermissionDenied(true);
        return;
      }
    }

    if (typeof DeviceMotionEvent === 'undefined') {
      alert('Motion sensor not available on this device/browser. Use a mobile phone.');
      return;
    }

    lastAccelRef.current = null;
    listenerRef.current = detectStep;
    window.addEventListener('devicemotion', listenerRef.current);
    setTracking(true);
    setPermissionDenied(false);
  };

  const stopTracking = () => {
    if (listenerRef.current) {
      window.removeEventListener('devicemotion', listenerRef.current);
      listenerRef.current = null;
    }
    setTracking(false);
    // Save to backend
    if (onStepsUpdate) onStepsUpdate(stepCountRef.current);
  };

  const displayValue = showStepTracker ? liveSteps : value;
  const displayProgress = showStepTracker
    ? Math.min((liveSteps / 10000) * 100, 100)
    : progress;

  return (
    <div className="metric-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {showSync && !showStepTracker && (
          <button
            className="sync-btn"
            onClick={(e) => { e.stopPropagation(); onSync && onSync(); }}
            title="Sync sensor data"
          >
            ⟳
          </button>
        )}
      </div>

      <div className="metric-value">
        {displayValue} <span className="metric-unit">{unit}</span>
      </div>

      <div className="metric-progress-bar">
        <div className="metric-fill" style={{ width: `${Math.min(displayProgress, 100)}%` }}></div>
      </div>

      {showStepTracker && (
        <div style={{ marginTop: '10px' }}>
          {permissionDenied && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0 0 6px' }}>
              Motion permission denied. Enable it in device settings.
            </p>
          )}
          <button
            className={`step-track-btn ${tracking ? 'stop' : 'start'}`}
            onClick={(e) => {
              e.stopPropagation();
              tracking ? stopTracking() : startTracking();
            }}
          >
            {tracking ? '⏹ Stop Walking' : '▶ Start Walking'}
          </button>
          {tracking && (
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '6px 0 0', fontWeight: 600 }}>
              📡 Counting steps...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
