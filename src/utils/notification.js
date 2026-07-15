let notificationContainer = null;
let notificationId = 0;

const getContainer = () => {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 10000; pointer-events: none;';
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
};

const removeNotification = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => el.remove(), 300);
  }
};

export const showNotification = (message, type = 'info', duration = 3000) => {
  const container = getContainer();
  const id = `notification-${notificationId++}`;

  const colors = { info: '#3b82f6', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };

  const notification = document.createElement('div');
  notification.id = id;
  notification.style.cssText = `
    position: relative; margin: 20px 20px 0 0; min-width: 300px; max-width: 500px;
    padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    pointer-events: auto; animation: slideIn 0.3s ease-out;
    background: ${colors[type] || colors.info}; color: white;
  `;

  const text = document.createElement('span');
  text.textContent = message;
  text.style.cssText = 'flex: 1; font-size: 14px; line-height: 1.4;';
  notification.appendChild(text);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; opacity: 0.8;';
  closeBtn.onclick = () => removeNotification(id);
  notification.appendChild(closeBtn);

  container.appendChild(notification);

  if (duration > 0) setTimeout(() => removeNotification(id), duration);
};

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);
