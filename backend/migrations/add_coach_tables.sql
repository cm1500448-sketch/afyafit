-- ============================================
-- COACHING SYSTEM DATABASE MIGRATION
-- Adds coach request and assignment tables
-- ============================================

USE youth_fitness;

-- ============================================
-- 1. COACH_REQUESTS TABLE
-- Stores user requests for coach assignment
-- ============================================
CREATE TABLE IF NOT EXISTS coach_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    goals TEXT NOT NULL,
    preferred_style VARCHAR(255) DEFAULT NULL,
    special_requirements TEXT DEFAULT NULL,
    status ENUM('pending', 'assigned', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for query optimization
    INDEX idx_user_status (user_id, status),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. COACH_ASSIGNMENTS TABLE
-- Tracks active coach-user assignments
-- ============================================
CREATE TABLE IF NOT EXISTS coach_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_by_admin_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint: one user can only have one active coach assignment
    UNIQUE KEY unique_user_assignment (user_id),
    
    -- Indexes for query optimization
    INDEX idx_coach_id (coach_id),
    INDEX idx_user_id (user_id),
    INDEX idx_assigned_at (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify the tables were created
-- ============================================

-- Check coach_requests table structure
-- DESCRIBE coach_requests;

-- Check coach_assignments table structure
-- DESCRIBE coach_assignments;

-- Check indexes
-- SHOW INDEX FROM coach_requests;
-- SHOW INDEX FROM coach_assignments;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Example: Insert a sample coach request
-- INSERT INTO coach_requests (user_id, reason, goals, preferred_style, status)
-- VALUES (1, 'I want to improve my fitness', 'Lose weight and build muscle', 'Motivational and supportive', 'pending');

-- Example: Insert a sample coach assignment
-- INSERT INTO coach_assignments (coach_id, user_id, assigned_by_admin_id)
-- VALUES (2, 1, 3);

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To remove these tables:
-- DROP TABLE IF EXISTS coach_assignments;
-- DROP TABLE IF EXISTS coach_requests;

-- ============================================
-- NOTES
-- ============================================
-- 1. Run this migration in phpMyAdmin or MySQL client
-- 2. Ensure users table exists before running
-- 3. Ensure users have appropriate roles (coach, admin) set up
-- 4. The unique constraint on user_id in coach_assignments ensures
--    one user can only have one active coach at a time
-- 5. Status 'pending' = waiting for assignment
--    Status 'assigned' = coach has been assigned
--    Status 'cancelled' = user cancelled the request
