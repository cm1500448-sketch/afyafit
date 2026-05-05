import { useState } from 'react';

// All available moods the user can pick from
const MOODS = [
  { id: 0, emoji: '😴', label: 'Tired',      score: 0 },
  { id: 1, emoji: '😰', label: 'Anxious',    score: 0 },
  { id: 2, emoji: '😔', label: 'Sad',        score: 0 },
  { id: 3, emoji: '😤', label: 'Frustrated', score: 1 },
  { id: 4, emoji: '😐', label: 'Neutral',    score: 1 },
  { id: 5, emoji: '😌', label: 'Calm',       score: 2 },
  { id: 6, emoji: '😊', label: 'Happy',      score: 2 },
  { id: 7, emoji: '💪', label: 'Motivated',  score: 3 },
  { id: 8, emoji: '🤩', label: 'Energized',  score: 3 },
  { id: 9, emoji: '🥰', label: 'Grateful',   score: 3 },
];

// Generate feedback based on the selected mood labels
const getFeedback = (selected) => {
  if (selected.length === 0) return null;

  const labels = selected.map(m => m.label);
  const avgScore = selected.reduce((sum, m) => sum + m.score, 0) / selected.length;

  if (labels.includes('Anxious') && labels.includes('Tired'))
    return "You're running on empty. Rest and a short breathing session can help reset your nervous system.";
  if (labels.includes('Anxious'))
    return "Anxiety detected. Try the breathing exercise below — even 2 minutes makes a difference.";
  if (labels.includes('Sad') && labels.includes('Tired'))
    return "Low energy and low mood often go together. Gentle movement or sunlight can shift this.";
  if (labels.includes('Frustrated'))
    return "Frustration is energy — channel it into your workout today.";
  if (labels.includes('Motivated') && labels.includes('Energized'))
    return "You're in peak state. Make the most of it — great day to push your limits.";
  if (labels.includes('Grateful') || labels.includes('Happy'))
    return "Positive mindset locked in. Keep that energy flowing through your day.";
  if (labels.includes('Calm'))
    return "Calm and steady. Perfect state for focused training or mindful rest.";
  if (avgScore >= 2.5)
    return "Strong mental state today. Your wellness is on track.";
  if (avgScore >= 1.5)
    return "Balanced day. Stay consistent with your habits.";
  return "Take it easy today. Rest is part of the process.";
};

const MoodCard = ({ selectedMood, isMoodConfirmed, onMoodSelect, onChangeMood }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleMood = (mood) => {
    setSelectedIds(prev =>
      prev.includes(mood.id)
        ? prev.filter(id => id !== mood.id)
        : [...prev, mood.id]
    );
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    const selected = MOODS.filter(m => selectedIds.includes(m.id));
    // Average score rounded, clamped to 0–3 for backend compatibility
    const avg = Math.round(selected.reduce((s, m) => s + m.score, 0) / selected.length);
    onMoodSelect(avg);
  };

  const handleChange = () => {
    setSelectedIds([]);
    onChangeMood();
  };

  const selectedMoods = MOODS.filter(m => selectedIds.includes(m.id));
  const feedback = getFeedback(selectedMoods);

  return (
    <div className="wellness-card mood-card">
      <h3>Mental Mood</h3>
      <p className="mood-subtitle">Select all that apply right now</p>

      {!isMoodConfirmed ? (
        <>
          <div className="mood-grid">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                className={`mood-tag ${selectedIds.includes(mood.id) ? 'selected' : ''}`}
                onClick={() => toggleMood(mood)}
              >
                <span className="mood-tag-emoji">{mood.emoji}</span>
                <span className="mood-tag-label">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Live feedback while selecting */}
          {feedback && (
            <div className="mood-feedback-preview">
              <p>{feedback}</p>
            </div>
          )}

          <button
            className="confirm-mood-btn"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            Confirm Mood
          </button>
        </>
      ) : (
        <div className="confirmed-mood-view">
          {/* Show confirmed mood tags */}
          <div className="confirmed-tags">
            {selectedMoods.length > 0
              ? selectedMoods.map(m => (
                  <span key={m.id} className="confirmed-tag">
                    {m.emoji} {m.label}
                  </span>
                ))
              : <span className="confirmed-tag">{MOODS[selectedMood]?.emoji} {MOODS[selectedMood]?.label}</span>
            }
          </div>

          {feedback && <p className="mood-tip">{feedback}</p>}

          <button className="change-link" onClick={handleChange}>
            Change Mood
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodCard;
