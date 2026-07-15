import { useEffect, useRef, useState } from 'react';
import './CoachChat.css';

const API = 'http://localhost:5000';

const isImage = (mime) => mime?.startsWith('image/');
const isVideo = (mime) => mime?.startsWith('video/');
const isPDF   = (mime) => mime === 'application/pdf';

function FileIcon({ mime }) {
  if (isPDF(mime))                                                          return <span className="file-icon pdf">PDF</span>;
  if (mime?.includes('word'))                                               return <span className="file-icon doc">DOC</span>;
  if (mime?.includes('excel') || mime?.includes('spreadsheet'))            return <span className="file-icon xls">XLS</span>;
  if (mime?.includes('powerpoint') || mime?.includes('presentation'))      return <span className="file-icon ppt">PPT</span>;
  if (mime?.includes('zip'))                                                return <span className="file-icon zip">ZIP</span>;
  return <span className="file-icon generic">FILE</span>;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CoachChat = ({ otherUserId, otherName, myRole }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const fileRef   = useRef(null);
  const token = localStorage.getItem('token');

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API}/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/messages/${otherUserId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() })
      });
      if (!res.ok) throw new Error('Failed to send');
      setInput('');
      await fetchMessages(true);
    } catch {
      setError('Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
    setPreview({ file, url, type });
    e.target.value = '';
  };

  const cancelPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const sendFile = async () => {
    if (!preview || sending) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('file', preview.file);
      if (input.trim()) form.append('caption', input.trim());
      const res = await fetch(`${API}/api/messages/${otherUserId}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }
      setInput('');
      cancelPreview();
      await fetchMessages(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const safeDate = (ts) => new Date(ts?.toString().replace(' ', 'T'));
  const formatTime = (ts) => { const d = safeDate(ts); return isNaN(d) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const formatDate = (ts) => {
    const d = safeDate(ts);
    if (isNaN(d)) return '';
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const isMyMessage = (msg) => myRole === 'coach' ? msg.sender_role === 'coach' : msg.sender_role === 'user';

  const grouped = messages.reduce((acc, msg) => {
    const d = safeDate(msg.created_at);
    const key = isNaN(d) ? 'Unknown' : d.toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const renderContent = (msg) => {
    const fileUrl = msg.file_url ? `${API}${msg.file_url}` : null;
    if (isImage(msg.mime_type) && fileUrl) {
      return (
        <div className="msg-media" onClick={() => setLightbox({ type: 'image', url: fileUrl })}>
          <img src={fileUrl} alt={msg.file_name || 'image'} className="msg-image" />
          {msg.content && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (isVideo(msg.mime_type) && fileUrl) {
      return (
        <div className="msg-media" onClick={() => setLightbox({ type: 'video', url: fileUrl })}>
          <video src={fileUrl} className="msg-video" controls={false} />
          <div className="video-play-overlay">▶</div>
          {msg.content && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (fileUrl) {
      return (
        <a className="msg-file" href={fileUrl} target="_blank" rel="noreferrer" download={msg.file_name}>
          <FileIcon mime={msg.mime_type} />
          <div className="file-info">
            <span className="file-name">{msg.file_name || 'File'}</span>
            <span className="file-size">{formatBytes(msg.file_size)}</span>
          </div>
          <span className="file-download">↓</span>
        </a>
      );
    }
    return <p className="bubble-text">{msg.content}</p>;
  };

  return (
    <>
      <div className="coach-chat">
        <div className="chat-header">
          <div className="chat-avatar">{otherName?.charAt(0)?.toUpperCase() || '?'}</div>
          <div className="chat-header-info">
            <span className="chat-name">{otherName}</span>
            <span className="chat-role">{myRole === 'coach' ? 'Your Athlete' : 'Your Coach'}</span>
          </div>
        </div>

        <div className="chat-messages">
          {loading && <div className="chat-loading">Loading messages...</div>}
          {!loading && messages.length === 0 && (
            <div className="chat-empty">
              <p>No messages yet.</p>
              <p className="chat-empty-hint">
                {myRole === 'coach' ? `Send ${otherName} a message to get started.` : 'Your coach will message you here.'}
              </p>
            </div>
          )}
          {Object.entries(grouped).map(([dateKey, dayMsgs]) => (
            <div key={dateKey}>
              <div className="chat-date-divider"><span>{formatDate(dayMsgs[0].created_at)}</span></div>
              {dayMsgs.map((msg) => {
                const isMe = isMyMessage(msg);
                return (
                  <div key={msg.id} className={`chat-bubble-row ${isMe ? 'me' : 'them'}`}>
                    <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      {renderContent(msg)}
                      <span className="bubble-time">
                        {formatTime(msg.created_at)}
                        {isMe && <span className="read-indicator">{msg.is_read ? ' ✓✓' : ' ✓'}</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <div className="chat-error">{error}</div>}

        {preview && (
          <div className="preview-bar">
            {preview.type === 'image' && <img src={preview.url} alt="preview" className="preview-thumb" />}
            {preview.type === 'video' && <video src={preview.url} className="preview-thumb" />}
            {preview.type === 'file' && <div className="preview-file-name">⊕ {preview.file.name}</div>}
            <button className="preview-cancel" onClick={cancelPreview}>✕</button>
          </div>
        )}

        <form className="chat-input-row" onSubmit={preview ? (e) => { e.preventDefault(); sendFile(); } : sendText}>
          <button type="button" className="chat-attach-btn" onClick={() => fileRef.current?.click()} title="Attach file" disabled={sending}>⊕</button>
          <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" style={{ display: 'none' }} onChange={onFileChange} />
          <input className="chat-input" type="text" placeholder={preview ? 'Add a caption (optional)...' : `Message ${otherName}...`} value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} disabled={sending} />
          <button className="chat-send-btn" type="submit" disabled={(!input.trim() && !preview) || sending}>
            {sending ? '...' : '➤'}
          </button>
        </form>
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          {lightbox.type === 'image' && <img src={lightbox.url} alt="full" className="lightbox-media" onClick={(e) => e.stopPropagation()} />}
          {lightbox.type === 'video' && <video src={lightbox.url} controls autoPlay className="lightbox-media" onClick={(e) => e.stopPropagation()} />}
        </div>
      )}
    </>
  );
};

export default CoachChat;
