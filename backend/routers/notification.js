import express from 'express';
import NotificationService from '../services/notification.service.js';
import { authenticateUser, authenticateCompany, authenticateAny } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Initialize notification service (will be set with Socket.io in app.js)
let notificationService = new NotificationService();

/**
 * Set notification service instance (called from app.js)
 * @param {NotificationService} service - Notification service instance
 */
export function setNotificationService(service) {
  notificationService = service;
}

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/notifications
 * Get notifications for authenticated user/company
 */
router.get('/', 
  authenticateAny,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['STATUS_UPDATE', 'NEW_APPLICATION', 'APPLICATION_WITHDRAWN', 'JOB_POSTED', 'JOB_DEADLINE_REMINDER', 'PROFILE_VIEW']),
    query('isRead').optional().isBoolean().withMessage('isRead must be boolean'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
        priority: req.query.priority
      };

      const result = await notificationService.getNotifications(userId, options);

      res.json({
        success: true,
        data: result.notifications,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * GET /api/notifications/stats
 * Get notification statistics for authenticated user/company
 */
router.get('/stats',
  authenticateAny,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const stats = await notificationService.getNotificationStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for authenticated user/company
 */
router.get('/unread-count',
  authenticateAny,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const Notification = (await import('../models/notification.model.js')).default;
      const count = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });

    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read',
  authenticateAny,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const notificationId = req.params.id;

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification.getSummary()
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to mark notification as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * PATCH /api/notifications/:id/unread
 * Mark notification as unread
 */
router.patch('/:id/unread',
  authenticateAny,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const notificationId = req.params.id;

      const Notification = (await import('../models/notification.model.js')).default;
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or access denied'
        });
      }

      const updatedNotification = await notification.markAsUnread();

      // Update unread count via socket
      if (notificationService.io) {
        const unreadCount = await Notification.getUnreadCount(userId);
        notificationService.io.to(`user_${userId}`).emit('unread_count_update', { count: unreadCount });
      }

      res.json({
        success: true,
        message: 'Notification marked as unread',
        data: updatedNotification.getSummary()
      });

    } catch (error) {
      console.error('Error marking notification as unread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as unread',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for authenticated user/company
 */
router.patch('/mark-all-read',
  authenticateAny,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const result = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
        data: {
          modifiedCount: result.modifiedCount
        }
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * DELETE /api/notifications/:id
 * Delete (deactivate) a notification
 */
router.delete('/:id',
  authenticateAny,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user?._id || req.company?._id;
      const notificationId = req.params.id;

      const result = await notificationService.deleteNotification(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
        data: result.getSummary()
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete notification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * POST /api/notifications/test
 * Create a test notification (development only)
 */
router.post('/test',
  authenticateAny,
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('recipientType').isIn(['user', 'company']).withMessage('Recipient type must be user or company'),
    body('type').isIn(['STATUS_UPDATE', 'NEW_APPLICATION', 'APPLICATION_WITHDRAWN', 'JOB_POSTED', 'JOB_DEADLINE_REMINDER', 'PROFILE_VIEW']).withMessage('Invalid notification type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  async (req, res) => {
    try {
      // Validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { recipientId, recipientType, type, title, message, priority = 'medium' } = req.body;

      // Create test notification
      const notification = await notificationService.createNotification({
        recipientId,
        recipientType,
        type,
        title,
        message,
        priority,
        data: {
          test: true,
          createdBy: req.user ? req.user._id : req.company._id,
          createdByType: req.user ? 'user' : 'company'
        }
      });

      res.status(201).json({
        message: 'Test notification created successfully',
        notification
      });
    } catch (error) {
      console.error('Test notification creation error:', error);
      res.status(500).json({
        message: 'Failed to create test notification',
        error: error.message
      });
    }
  }
);

export default router;
