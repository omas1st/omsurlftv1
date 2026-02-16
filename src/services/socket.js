import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token = null) {
    // Already connected – do nothing
    if (this.socket && this.socket.connected) {
      return;
    }
    // Socket exists but disconnected – reconnect
    if (this.socket) {
      this.socket.connect();
      return;
    }

    const options = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000
    };

    if (token) {
      options.auth = { token };
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', options);

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      
      // Re-register all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.reconnectAttempts = 0; // Reset reconnect attempts
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data, callback) {
    if (this.socket && this.socket.connected) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } else {
      console.warn('Socket not connected, cannot emit:', event);
      return false;
    }
  }

  // Analytics events
  trackUrlClick(alias) {
    this.emit('track_click', { alias });
  }

  trackAnalyticsView(alias) {
    this.emit('analytics_view', { alias });
  }

  trackQrCodeScan(alias) {
    this.emit('qr_scan', { alias });
  }

  trackTextPageView(alias) {
    this.emit('text_view', { alias });
  }

  // Real-time analytics updates
  subscribeToAnalytics(alias, callback) {
    const event = `analytics:${alias}`;
    this.on(event, callback);
    this.emit('subscribe_analytics', { alias });
  }

  unsubscribeFromAnalytics(alias, callback) {
    const event = `analytics:${alias}`;
    this.off(event, callback);
    this.emit('unsubscribe_analytics', { alias });
  }

  // Real-time notification updates
  subscribeToNotifications(userId, callback) {
    const event = `notifications:${userId}`;
    this.on(event, callback);
    this.emit('subscribe_notifications', { userId });
  }

  unsubscribeFromNotifications(userId, callback) {
    const event = `notifications:${userId}`;
    this.off(event, callback);
    this.emit('unsubscribe_notifications', { userId });
  }

  // Admin real-time updates
  subscribeToAdminUpdates(adminId, callback) {
    const event = `admin:${adminId}`;
    this.on(event, callback);
    this.emit('subscribe_admin', { adminId });
  }

  unsubscribeFromAdminUpdates(adminId, callback) {
    const event = `admin:${adminId}`;
    this.off(event, callback);
    this.emit('unsubscribe_admin', { adminId });
  }

  // Chat/Text page replies
  subscribeToTextReplies(textId, callback) {
    const event = `text_replies:${textId}`;
    this.on(event, callback);
    this.emit('subscribe_text_replies', { textId });
  }

  unsubscribeFromTextReplies(textId, callback) {
    const event = `text_replies:${textId}`;
    this.off(event, callback);
    this.emit('unsubscribe_text_replies', { textId });
  }

  sendTextReply(textId, reply) {
    this.emit('text_reply', { textId, reply });
  }

  // Bulk upload progress
  subscribeToBulkProgress(uploadId, callback) {
    const event = `bulk_progress:${uploadId}`;
    this.on(event, callback);
    this.emit('subscribe_bulk_progress', { uploadId });
  }

  unsubscribeFromBulkProgress(uploadId, callback) {
    const event = `bulk_progress:${uploadId}`;
    this.off(event, callback);
    this.emit('unsubscribe_bulk_progress', { uploadId });
  }

  // Check connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Reconnect manually
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

const socketService = new SocketService();
export default socketService;