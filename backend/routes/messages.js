/**
 * COACH-USER MESSAGING ROUTES
 * Supports text messages, images, videos, and file attachments.
 * Files are stored in backend/uploads/chat/
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// ── Ensure uploads directory exists ──────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Multer storage config ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

// Allowed MIME types
const ALLOWED_MIME = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Videos
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  // Archives
  'application/zip',
  'application/x-zip-compressed'
];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// ── Helper: determine message_type from MIME ──────────────────────────────────
function getMsgType(mimetype) {
  if (!mimetype) return 'text';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'file';
}

// ── Helper: verify coach-user relationship ────────────────────────────────────
async function verifyRelationship(myId, otherId) {
  const [rows] = await db.execute(
    `SELECT id FROM coach_assignments
     WHERE (coach_id = ? AND user_id = ?) OR (coach_id = ? AND user_id = ?)`,
    [myId, otherId, otherId, myId]
  );
  return rows.length > 0;
}

// ── Helper: get sender role ───────────────────────────────────────────────────
async function getSenderRole(userId) {
  const [rows] = await db.execute(
    `SELECT r.name FROM users u JOIN roles r ON u.primary_role_id = r.id WHERE u.id = ?`,
    [userId]
  );
  return rows[0]?.name || 'user';
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/:otherUserId  — fetch conversation
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId);

    if (!(await verifyRelationship(myId, otherId))) {
      return res.status(403).json({ error: 'No coach-user relationship found' });
    }

    const [messages] = await db.execute(
      `SELECT id, sender_role, message_type, content,
              file_url, file_name, file_size, mime_type,
              is_read, created_at, coach_id, user_id
       FROM coach_messages
       WHERE (coach_id = ? AND user_id = ?) OR (coach_id = ? AND user_id = ?)
       ORDER BY created_at ASC
       LIMIT 200`,
      [myId, otherId, otherId, myId]
    );

    // Mark incoming messages as read
    await db.execute(
      `UPDATE coach_messages SET is_read = 1
       WHERE is_read = 0
         AND ((coach_id = ? AND user_id = ? AND sender_role = 'user')
           OR (coach_id = ? AND user_id = ? AND sender_role = 'coach'))`,
      [otherId, myId, myId, otherId]
    );

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/:otherUserId  — send text message
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId);
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ error: 'Message cannot exceed 2000 characters' });
    }

    const senderRole = await getSenderRole(myId);
    const coachId = senderRole === 'coach' ? myId : otherId;
    const userId  = senderRole === 'coach' ? otherId : myId;
    const senderRoleEnum = senderRole === 'coach' ? 'coach' : 'user';

    if (!(await verifyRelationship(myId, otherId))) {
      return res.status(403).json({ error: 'No coach-user relationship found' });
    }

    const [result] = await db.execute(
      `INSERT INTO coach_messages (coach_id, user_id, sender_role, message_type, content)
       VALUES (?, ?, ?, 'text', ?)`,
      [coachId, userId, senderRoleEnum, content.trim()]
    );

    const [newMsg] = await db.execute(
      `SELECT * FROM coach_messages WHERE id = ?`, [result.insertId]
    );

    // Notify recipient — don't await so it doesn't slow the response
    const { createNotification } = require('../utils/notificationHelper');
    const recipientId = senderRoleEnum === 'coach' ? userId : coachId;
    createNotification(
      recipientId,
      'new_message',
      '💬 New message',
      senderRoleEnum === 'coach' ? 'Your coach sent you a message.' : 'Your athlete sent you a message.',
      senderRoleEnum === 'coach' ? '/profile' : '/dashboard'
    ).catch(() => {});

    res.status(201).json({ message: newMsg[0] });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages/:otherUserId/upload  — send file/image/video
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:otherUserId/upload', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50 MB.' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId);

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!(await verifyRelationship(myId, otherId))) {
      // Delete uploaded file if relationship check fails
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({ error: 'No coach-user relationship found' });
    }

    const senderRole = await getSenderRole(myId);
    const coachId = senderRole === 'coach' ? myId : otherId;
    const userId  = senderRole === 'coach' ? otherId : myId;
    const senderRoleEnum = senderRole === 'coach' ? 'coach' : 'user';

    const msgType = getMsgType(req.file.mimetype);
    // Public URL path served by Express static middleware
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const caption = req.body.caption || null;

    const [result] = await db.execute(
      `INSERT INTO coach_messages
         (coach_id, user_id, sender_role, message_type, content, file_url, file_name, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        coachId, userId, senderRoleEnum, msgType,
        caption,
        fileUrl,
        req.file.originalname,
        req.file.size,
        req.file.mimetype
      ]
    );

    const [newMsg] = await db.execute(
      `SELECT * FROM coach_messages WHERE id = ?`, [result.insertId]
    );

    res.status(201).json({ message: newMsg[0] });
  } catch (err) {
    console.error('Upload message error:', err);
    res.status(500).json({ error: 'Failed to send file' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/:otherUserId/unread-count
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:otherUserId/unread-count', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId);

    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM coach_messages
       WHERE is_read = 0
         AND ((coach_id = ? AND user_id = ? AND sender_role = 'user')
           OR (coach_id = ? AND user_id = ? AND sender_role = 'coach'))`,
      [otherId, myId, myId, otherId]
    );

    res.json({ unread: rows[0]?.count || 0 });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
