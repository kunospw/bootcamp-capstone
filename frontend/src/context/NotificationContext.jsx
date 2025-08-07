import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  socket: null,
  isConnected: false
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case ActionTypes.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? action.payload : notification
        )
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    
    case ActionTypes.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case ActionTypes.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case ActionTypes.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };
    
    case ActionTypes.SET_SOCKET:
      return { ...state, socket: action.payload };
    
    case ActionTypes.SET_CONNECTION_STATUS:
      return { ...state, isConnected: action.payload };
    
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [], unreadCount: 0 };
    
    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext();

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (token && userId) {
      const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      dispatch({ type: ActionTypes.SET_SOCKET, payload: socket });

      // Connection events
      socket.on('connect', () => {
        console.log('[SOCKET] Connected to notification server');
        dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: true });
        
        // Authenticate user for notifications
        socket.emit('authenticate', { userId, userType });
      });

      socket.on('disconnect', () => {
        console.log('[SOCKET] Disconnected from notification server');
        dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: false });
      });

      socket.on('authenticated', (data) => {
        console.log('[SOCKET] Authenticated for notifications:', data);
      });

      // Notification events
      socket.on('new_notification', (notification) => {
        console.log('[NOTIFICATION] New notification received:', notification);
        dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
        
        // Show toast notification
        showToastNotification(notification);
      });

      socket.on('unread_count_update', (data) => {
        console.log('[NOTIFICATION] Unread count updated:', data.count);
        dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: data.count });
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // API calls
  const api = {
    async fetchNotifications(page = 1, limit = 20, filters = {}) {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
        
        console.log('[NOTIFICATION] Fetching notifications...', { userId, userType, token: token ? 'present' : 'missing' });
        
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters
        });

        const url = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/api/notifications?${queryParams}`;
        console.log('[NOTIFICATION] Fetching from URL:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[NOTIFICATION] Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[NOTIFICATION] Error response:', errorText);
          throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[NOTIFICATION] Fetched data:', data);
        
        if (page === 1) {
          dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: data.data });
        } else {
          // Append for pagination
          dispatch({ 
            type: ActionTypes.SET_NOTIFICATIONS, 
            payload: [...state.notifications, ...data.data] 
          });
        }
        
        dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: data.pagination.unreadCount });
        
        return data;
      } catch (error) {
        console.error('[NOTIFICATION] Error fetching notifications:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async markAsRead(notificationId) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/api/notifications/${notificationId}/read`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }

        dispatch({ type: ActionTypes.MARK_AS_READ, payload: notificationId });
        
        // Also emit to socket for real-time update
        if (state.socket) {
          state.socket.emit('mark_notification_read', { notificationId });
        }
        
        return true;
      } catch (error) {
        console.error('[NOTIFICATION] Error marking as read:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async markAllAsRead() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/api/notifications/mark-all-read`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to mark all notifications as read');
        }

        dispatch({ type: ActionTypes.MARK_ALL_AS_READ });
        return true;
      } catch (error) {
        console.error('[NOTIFICATION] Error marking all as read:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async deleteNotification(notificationId) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/api/notifications/${notificationId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }

        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notificationId });
        return true;
      } catch (error) {
        console.error('[NOTIFICATION] Error deleting notification:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async getUnreadCount() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/api/notifications/unread-count`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get unread count');
        }

        const data = await response.json();
        dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: data.data.count });
        return data.data.count;
      } catch (error) {
        console.error('[NOTIFICATION] Error getting unread count:', error);
        throw error;
      }
    }
  };

  // Show toast notification
  const showToastNotification = (notification) => {
    // Create a simple toast notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg', // Adjust path as needed
        tag: notification.id
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const value = {
    ...state,
    ...api,
    requestNotificationPermission,
    showToastNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
