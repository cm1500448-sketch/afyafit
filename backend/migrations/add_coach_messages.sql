-- Coach-user messaging table
-- Supports text messages and voice note URLs
CREATE TABLE IF NOT EXISTS coach_messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  coach_id     INT NOT NULL,
  user_id      INT NOT NULL,
  sender_role  ENUM('coach', 'user') NOT NULL,
  message_type ENUM('text', 'voice') NOT NULL DEFAULT 'text',
  content      TEXT,
  voice_url    VARCHAR(500),
  is_read      TINYINT(1) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coach_user (coach_id, user_id),
  INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
