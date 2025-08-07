import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import './ToastNotification.css';

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  // Listen for new notifications from context
  const { notifications } = useNotifications();

  useEffect(() => {
    // Get the latest notification if it's new
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const now = Date.now();
      const notificationTime = new Date(latestNotification.createdAt).getTime();
      
      // Only show toast if notification is less than 5 seconds old
      if (now - notificationTime < 5000) {
        showToast(latestNotification);
      }
    }
  }, [notifications]);

  const showToast = (notification) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    const newToast = {
      id: toastId,
      ...notification,
      visible: true
    };

    setToasts(prev => [newToast, ...prev.slice(0, 2)]); // Keep max 3 toasts

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.map(toast => 
      toast.id === toastId ? { ...toast, visible: false } : toast
    ));

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 300);
  };

  const handleToastClick = (toast) => {
    if (toast.actionUrl) {
      window.location.href = toast.actionUrl;
    }
    removeToast(toast.id);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'toast-urgent';
      case 'high': return 'toast-high';
      case 'medium': return 'toast-medium';
      case 'low': return 'toast-low';
      default: return 'toast-medium';
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

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${getPriorityClass(toast.priority)} ${toast.visible ? 'toast-visible' : 'toast-hidden'}`}
          onClick={() => handleToastClick(toast)}
        >
          <div className="toast-content">
            <div className="toast-icon">
              {getTypeIcon(toast.type)}
            </div>
            
            <div className="toast-body">
              <div className="toast-title">
                {toast.title}
              </div>
              <div className="toast-message">
                {toast.message.length > 100 
                  ? toast.message.substring(0, 100) + '...' 
                  : toast.message
                }
              </div>
              {toast.actionText && (
                <div className="toast-action">
                  {toast.actionText} →
                </div>
              )}
            </div>
            
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              ×
            </button>
          </div>
          
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
