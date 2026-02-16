// src/services/notification.js
import socketService from './socket';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = new Set();
    this.unreadCount = 0;
  }

  // Initialize notification service
  initialize(userId) {
    if (userId) {
      socketService.subscribeToNotifications(userId, this.handleNotification.bind(this));
    }
  }

  // Handle incoming notification
  handleNotification(notification) {
    this.notifications.unshift(notification);
    this.unreadCount++;
    
    // Show browser notification if allowed
    if (this.shouldShowBrowserNotification()) {
      this.showBrowserNotification(notification);
    }
    
    // Notify all listeners
    this.notifyListeners();
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  // Request notification permission
  requestPermission() {
    if (!('Notification' in window)) {
      return Promise.resolve(false);
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve(true);
    }

    if (Notification.permission === 'denied') {
      return Promise.resolve(false);
    }

    return Notification.requestPermission().then((permission) => {
      return permission === 'granted';
    });
  }

  // Check if we should show browser notification
  shouldShowBrowserNotification() {
    return (
      'Notification' in window &&
      Notification.permission === 'granted' &&
      document.visibilityState === 'hidden'
    );
  }

  // Add notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);
    this.unreadCount++;
    this.notifyListeners();

    return newNotification;
  }

  // Get all notifications
  getNotifications() {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter((n) => !n.read);
  }

  // Get notification by ID
  getNotification(id) {
    return this.notifications.find((n) => n.id === id);
  }

  // Mark notification as read
  markAsRead(id) {
    const notification = this.getNotification(id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount--;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
      }
    });
    this.unreadCount = 0;
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(id) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      if (!notification.read) {
        this.unreadCount--;
      }
      this.notifications.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.notifyListeners();
  }

  // Get unread count
  getUnreadCount() {
    return this.unreadCount;
  }

  // Add event listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove event listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach((callback) => {
      callback({
        notifications: this.notifications,
        unreadCount: this.unreadCount,
      });
    });
  }

  // Send notification to user (admin function)
  sendToUser(userId, notification) {
    return socketService.emit('send_notification', { userId, notification });
  }

  // Send notification to all users (admin function)
  sendToAll(notification) {
    return socketService.emit('broadcast_notification', notification);
  }

  // Create notification types
  createNotificationTypes = {
    urlCreated: (url) => ({
      type: 'url_created',
      title: 'URL Created',
      message: `Your short URL /${url.alias} has been created`,
      icon: '🔗',
      action: {
        type: 'navigate',
        path: `/${url.alias}/analytics`,
      },
    }),

    qrCodeCreated: (qr) => ({
      type: 'qr_created',
      title: 'QR Code Created',
      message: `Your QR code for /${qr.alias} has been generated`,
      icon: '📱',
      action: {
        type: 'navigate',
        path: `/${qr.alias}/analytics`,
      },
    }),

    textPageCreated: (text) => ({
      type: 'text_created',
      title: 'Text Page Created',
      message: `Your text page /${text.alias} has been created`,
      icon: '📝',
      action: {
        type: 'navigate',
        path: `/${text.alias}`,
      },
    }),

    newReply: (text, reply) => ({
      type: 'new_reply',
      title: 'New Reply',
      message: `Someone replied to your text page /${text.alias}`,
      icon: '💬',
      action: {
        type: 'navigate',
        path: `/${text.alias}`,
      },
    }),

    urlRestricted: (url, reason) => ({
      type: 'url_restricted',
      title: 'URL Restricted',
      message: `Your URL /${url.alias} has been restricted: ${reason}`,
      icon: '⛔',
      action: {
        type: 'navigate',
        path: '/manage',
      },
    }),

    userRestricted: (reason) => ({
      type: 'user_restricted',
      title: 'Account Restricted',
      message: `Your account has been restricted: ${reason}`,
      icon: '🔒',
      action: {
        type: 'navigate',
        path: '/dashboard',
      },
    }),

    analyticsMilestone: (url, milestone) => ({
      type: 'analytics_milestone',
      title: 'Analytics Milestone',
      message: `Your URL /${url.alias} reached ${milestone} visitors!`,
      icon: '🎉',
      action: {
        type: 'navigate',
        path: `/${url.alias}/analytics`,
      },
    }),

    coinEarned: (amount, source) => ({
      type: 'coin_earned',
      title: 'Coins Earned',
      message: `You earned ${amount} coins from ${source}`,
      icon: '🪙',
      action: {
        type: 'navigate',
        path: '/dashboard',
      },
    }),

    tierUpgraded: (tier) => ({
      type: 'tier_upgraded',
      title: 'Tier Upgraded',
      message: `Your account has been upgraded to ${tier} tier`,
      icon: '⭐',
      action: {
        type: 'navigate',
        path: '/dashboard',
      },
    }),

    bulkUploadComplete: (success, failed) => ({
      type: 'bulk_upload_complete',
      title: 'Bulk Upload Complete',
      message: `Bulk upload completed: ${success} successful, ${failed} failed`,
      icon: '📁',
      action: {
        type: 'navigate',
        path: '/manage',
      },
    }),
  };

  // Cleanup
  cleanup() {
    socketService.disconnect();
    this.listeners.clear();
  }
}

const notificationService = new NotificationService();
export default notificationService;