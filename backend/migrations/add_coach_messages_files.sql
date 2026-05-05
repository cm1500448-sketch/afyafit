-- Add file attachment support to coach_messages
-- Run this if the table already exists from add_coach_messages.sql

ALTER TABLE coach_messages
  MODIFY COLUMN message_type ENUM('text', 'image', 'video', 'file', 'voice') NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS file_url    VARCHAR(1000) DEFAULT NULL AFTER voice_url,
  ADD COLUMN IF NOT EXISTS file_name   VARCHAR(255)  DEFAULT NULL AFTER file_url,
  ADD COLUMN IF NOT EXISTS file_size   INT           DEFAULT NULL AFTER file_name,
  ADD COLUMN IF NOT EXISTS mime_type   VARCHAR(100)  DEFAULT NULL AFTER file_size;

-- Or create fresh if it doesn't exist yet:
CREATE TABLE IF NOT EXISTS coach_messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  coach_id     INT NOT NULL,
  user_id      INT NOT NULL,
  sender_role  ENUM('coach', 'user') NOT NULL,
  message_type ENUM('text', 'image', 'video', 'file', 'voice') NOT NULL DEFAULT 'text',
  content      TEXT,
  voice_url    VARCHAR(500),
  file_url     VARCHAR(1000),
  file_name    VARCHAR(255),
  file_size    INT,
  mime_type    VARCHAR(100),
  is_read      TINYINT(1) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coach_user (coach_id, user_id),
  INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
