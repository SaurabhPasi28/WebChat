// Enhanced Notification utility with multiple fallback methods

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.audio = null;
    this.initAudio();
    
    // Track page visibility
    this.isPageVisible = !document.hidden;
    this.setupVisibilityListener();
  }

  /**
   * Initialize notification sound
   */
  initAudio() {
    try {
      // Create notification sound using Web Audio API
      this.audio = new Audio();
      // Using a data URL for a simple notification beep
      this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBQAAAA==';
      this.audio.volume = 0.5;
    } catch (error) {
      console.warn('Could not initialize audio:', error);
    }
  }

  /**
   * Setup page visibility listener
   */
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      console.log('📱 Page visibility changed:', this.isPageVisible ? 'VISIBLE' : 'HIDDEN');
    });
  }

  /**
   * Play notification sound
   */
  playSound() {
    try {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(e => console.warn('Could not play sound:', e));
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
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
      // Check current permission first
      if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted');
        this.permission = 'granted';
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        console.warn('❌ Notification permission was previously denied');
        this.permission = 'denied';
        return 'denied';
      }

      // Request permission
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      this.permission = permission;
      console.log('🔔 Notification permission result:', permission);
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
    const granted = this.isSupported && Notification.permission === 'granted';
    console.log('🔍 Checking notification permission:', {
      isSupported: this.isSupported,
      permission: Notification.permission,
      granted: granted
    });
    return granted;
  }

  /**
   * Show a notification with multiple methods
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   * @returns {Notification|null}
   */
  show(title, options = {}) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔔 NOTIFICATION TRIGGERED');
    console.log('📌 Title:', title);
    console.log('📌 Page Visible:', this.isPageVisible);
    console.log('📌 Document Hidden:', document.hidden);
    console.log('� Permission:', Notification.permission);
    console.log('� Is Granted:', this.isGranted());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Play sound regardless of permission
    this.playSound();
    
    // Update page title to attract attention
    this.updatePageTitle(title);
    
    if (!this.isGranted()) {
      console.warn('❌ Notification permission not granted. Current permission:', Notification.permission);
      // Still play sound and update title even without permission
      return null;
    }

    try {
      // Create notification with maximum visibility settings
      const notification = new Notification(title, {
        icon: '/webchat.svg',
        badge: '/webchat.svg',
        body: options.body || '',
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: false,
        silent: false, // Ensure sound plays
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        ...options
      });

      console.log('✅ Browser notification created successfully!');

      // Add event listeners
      notification.onshow = () => {
        console.log('👀 Notification displayed on screen');
      };

      notification.onerror = (error) => {
        console.error('❌ Notification error:', error);
      };

      notification.onclose = () => {
        console.log('❎ Notification closed');
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          console.warn('Could not close notification:', e);
        }
      }, 10000);

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      console.error('Error details:', error.message, error.stack);
      return null;
    }
  }

  /**
   * Update page title to attract attention
   * @param {string} message - Message to show
   */
  updatePageTitle(message) {
    const originalTitle = document.title;
    let count = 0;
    const maxBlinks = 10;

    const interval = setInterval(() => {
      document.title = count % 2 === 0 ? '🔴 New Message!' : message;
      count++;

      if (count >= maxBlinks || this.isPageVisible) {
        document.title = originalTitle;
        clearInterval(interval);
      }
    }, 1000);
  }

  /**
   * Show a new message notification with all methods
   * @param {object} params - Message parameters
   */
  showNewMessage({ username, message, avatar, onClick }) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('� NEW MESSAGE NOTIFICATION');
    console.log('👤 From:', username);
    console.log('📨 Message:', message.substring(0, 50));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const notification = this.show(`💬 ${username}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: `message-${username}-${Date.now()}`,
      vibrate: [200, 100, 200],
      silent: false,
      requireInteraction: false,
      data: { username, timestamp: Date.now() }
    });

    if (notification) {
      notification.onclick = () => {
        console.log('🖱️ Notification clicked by user');
        window.focus();
        if (onClick) {
          onClick();
        }
        try {
          notification.close();
        } catch (e) {
          console.warn('Could not close notification:', e);
        }
      };
    }

    // Vibrate device if supported (mobile)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
        console.log('📳 Vibration triggered');
      } catch (e) {
        console.warn('Vibration not supported:', e);
      }
    }

    return notification;
  }

  /**
   * Force show notification - Try multiple times if needed
   * @param {object} params - Message parameters
   */
  forceShowNotification({ username, message, onClick }) {
    console.log('🚨 FORCE SHOWING NOTIFICATION');
    
    // Try showing immediately
    this.showNewMessage({ username, message, onClick });
    
    // If page is hidden, try again after a brief delay
    if (!this.isPageVisible) {
      console.log('⏰ Page hidden - will retry notification');
      setTimeout(() => {
        this.showNewMessage({ username, message, onClick });
      }, 500);
    }
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
