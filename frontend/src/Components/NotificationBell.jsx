import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { 
    unreadCount, 
    isConnected, 
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when bell is opened
  useEffect(() => {
    if (isOpen) {
      console.log('[NOTIFICATION BELL] Opening, current notifications count:', notifications.length);
      console.log('[NOTIFICATION BELL] Current notifications:', notifications);
      handleFetchNotifications();
    }
  }, [isOpen]);

  const handleFetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('[NOTIFICATION BELL] Fetching notifications...');
      const result = await fetchNotifications(1, 10);
      console.log('[NOTIFICATION BELL] Fetch completed, result:', result);
      console.log('[NOTIFICATION BELL] Notifications after fetch:', notifications.length);
    } catch (error) {
      console.error('[NOTIFICATION BELL] Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#0891b2';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'STATUS_UPDATE': return '📝';
      case 'NEW_APPLICATION': return '📋';
      case 'APPLICATION_WITHDRAWN': return '↩️';
      case 'JOB_POSTED': return '💼';
      case 'JOB_DEADLINE_REMINDER': return '⏰';
      case 'PROFILE_VIEW': return '👁️';
      default: return '📢';
    }
  };

  return (
    <div className="notification-bell-container">
      <button
        className={`notification-bell ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <svg
          className="bell-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection status indicator */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`} />
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="mark-all-read-btn"
                onClick={handleFetchNotifications}
                title="Refresh notifications"
                style={{ fontSize: '12px', padding: '4px 6px' }}
              >
                🔄
              </button>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <span>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="notification-body">
                      <div className="notification-title">
                        {notification.title}
                        <div 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(notification.priority) }}
                        />
                      </div>
                      
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      
                      <div className="notification-meta">
                        <span className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.actionText && (
                          <span className="notification-action">
                            {notification.actionText}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="delete-notification-btn"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      aria-label="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="notification-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
