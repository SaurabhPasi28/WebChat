// Notification utility for browser notifications

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
  }

  /**
   * Request permission for browser notifications
   * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'default'
   */
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are granted
   * @returns {boolean}
   */
  isGranted() {
    return this.isSupported && Notification.permission === 'granted';
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   * @returns {Notification|null}
   */
  show(title, options = {}) {
    if (!this.isGranted()) {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/webchat.svg',
        badge: '/webchat.svg',
        requireInteraction: false,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show a new message notification
   * @param {object} params - Message parameters
   */
  showNewMessage({ username, message, avatar, onClick }) {
    const notification = this.show(`New message from ${username}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: `message-${username}`, // Prevents duplicate notifications
      vibrate: [200, 100, 200], // Vibration pattern (if supported)
      silent: false,
      data: { username }
    });

    if (notification && onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    return notification;
  }

  /**
   * Show a message delivered notification (optional)
   * @param {string} username - Receiver username
   */
  showMessageDelivered(username) {
    return this.show('Message Delivered', {
      body: `Your message to ${username} was delivered`,
      tag: `delivered-${username}`,
      silent: true,
      requireInteraction: false
    });
  }

  /**
   * Show a message seen notification
   * @param {string} username - Reader username
   * @param {number} count - Number of messages seen
   */
  showMessageSeen(username, count = 1) {
    return this.show('Message Seen', {
      body: `${username} has seen ${count > 1 ? `${count} messages` : 'your message'}`,
      tag: `seen-${username}`,
      silent: true,
      requireInteraction: false
    });
  }

  /**
   * Show typing indicator notification (optional)
   * @param {string} username
   */
  showTyping(username) {
    return this.show('Typing...', {
      body: `${username} is typing a message`,
      tag: `typing-${username}`,
      silent: true,
      requireInteraction: false
    });
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    if (this.isSupported) {
      // Close all notifications (browser-specific)
      console.log('Clearing all notifications');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
