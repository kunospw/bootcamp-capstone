import Notification, { NotificationType, ApplicationStatus } from '../models/notification.model.js';
import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import Job from '../models/job.model.js';
import Application from '../models/application.model.js';
import { Server } from 'socket.io';

/**
 * Enterprise Notification Service
 * Handles creation, delivery, and management of notifications
 */
class NotificationService {
  constructor(io = null) {
    this.io = io; // Socket.io instance
    this.templates = this.initializeTemplates();
  }

  /**
   * Set Socket.io instance
   * @param {Server} io - Socket.io server instance
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Initialize notification templates
   * @returns {Object} - Notification templates
   */
  initializeTemplates() {
    return {
      [NotificationType.STATUS_UPDATE]: {
        [ApplicationStatus.UNDER_REVIEW]: {
          title: 'Application Under Review',
          message: 'Your application for {jobTitle} at {companyName} is now under review.',
          priority: 'medium',
          actionText: 'View Application'
        },
        [ApplicationStatus.SHORTLISTED]: {
          title: 'Great News! You\'ve Been Shortlisted',
          message: 'Congratulations! You\'ve been shortlisted for {jobTitle} at {companyName}.',
          priority: 'high',
          actionText: 'View Details'
        },
        [ApplicationStatus.INTERVIEW_SCHEDULED]: {
          title: 'Interview Scheduled',
          message: 'Your interview for {jobTitle} at {companyName} has been scheduled.',
          priority: 'urgent',
          actionText: 'View Interview Details'
        },
        [ApplicationStatus.JOB_OFFERED]: {
          title: 'Job Offer Received!',
          message: 'Congratulations! You\'ve received a job offer for {jobTitle} at {companyName}.',
          priority: 'urgent',
          actionText: 'View Offer'
        },
        [ApplicationStatus.REJECTED]: {
          title: 'Application Update',
          message: 'Thank you for your interest in {jobTitle} at {companyName}. We\'ve decided to move forward with other candidates.',
          priority: 'medium',
          actionText: 'View Feedback'
        }
      },
      [NotificationType.NEW_APPLICATION]: {
        title: 'New Application Received',
        message: 'You have received a new application from {applicantName} for {jobTitle}.',
        priority: 'high',
        actionText: 'Review Application'
      },
      [NotificationType.APPLICATION_WITHDRAWN]: {
        title: 'Application Withdrawn',
        message: '{applicantName} has withdrawn their application for {jobTitle}.',
        priority: 'medium',
        actionText: 'View Details'
      },
      [NotificationType.JOB_POSTED]: {
        title: 'New Job Opportunity',
        message: 'A new {jobTitle} position has been posted at {companyName} that matches your profile.',
        priority: 'medium',
        actionText: 'View Job'
      },
      [NotificationType.JOB_DEADLINE_REMINDER]: {
        title: 'Application Deadline Reminder',
        message: 'The application deadline for {jobTitle} at {companyName} is approaching in {daysLeft} days.',
        priority: 'high',
        actionText: 'Apply Now'
      }
    };
  }

  /**
   * Create and send a notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  async createNotification(notificationData) {
    try {
      const {
        recipient,
        recipientModel,
        sender,
        senderModel,
        type,
        relatedJob,
        relatedApplication,
        customData = {},
        templateData = {}
      } = notificationData;

      // Get notification template
      const template = this.getNotificationTemplate(type, customData.status);
      
      // Generate notification content
      const notificationContent = await this.generateNotificationContent(
        template,
        templateData,
        relatedJob,
        relatedApplication
      );

      // Create notification document
      const notification = new Notification({
        recipient,
        recipientModel,
        sender,
        senderModel,
        type,
        title: notificationContent.title,
        message: notificationContent.message,
        relatedJob,
        relatedApplication,
        relatedData: customData,
        priority: notificationContent.priority,
        actionUrl: notificationContent.actionUrl,
        actionText: notificationContent.actionText
      });

      const savedNotification = await notification.save();

      // Populate related data for socket emission
      await savedNotification.populate([
        { path: 'relatedJob', select: 'title companyId location' },
        { path: 'relatedApplication', select: 'status dateApplied' },
        { path: 'senderDetails', select: 'name email companyName' }
      ]);

      // Send real-time notification
      await this.sendRealTimeNotification(savedNotification);

      // Log notification creation
      console.log(`[NOTIFICATION] Created ${type} notification for ${recipientModel} ${recipient}`);

      return savedNotification;

    } catch (error) {
      console.error('[NOTIFICATION] Error creating notification:', error);
      throw new NotificationError('Failed to create notification', error);
    }
  }

  /**
   * Send application status update notification
   * @param {string} applicationId - Application ID
   * @param {string} newStatus - New application status
   * @param {string} updatedBy - Who updated the status
   * @returns {Promise<Object>} - Created notification
   */
  async sendStatusUpdateNotification(applicationId, newStatus, updatedBy) {
    try {
      const application = await Application.findById(applicationId)
        .populate('userId', 'name email')
        .populate('jobId', 'title companyId')
        .populate({
          path: 'jobId',
          populate: {
            path: 'companyId',
            select: 'companyName'
          }
        });

      if (!application) {
        throw new Error('Application not found');
      }

      const templateData = {
        jobTitle: application.jobId.title,
        companyName: application.jobId.companyId.companyName,
        applicantName: application.userId.name,
        status: newStatus
      };

      return await this.createNotification({
        recipient: application.userId._id,
        recipientModel: 'User',
        sender: updatedBy,
        senderModel: 'Company',
        type: NotificationType.STATUS_UPDATE,
        relatedJob: application.jobId._id,
        relatedApplication: application._id,
        customData: { status: newStatus, previousStatus: application.status },
        templateData
      });

    } catch (error) {
      console.error('[NOTIFICATION] Error sending status update:', error);
      throw new NotificationError('Failed to send status update notification', error);
    }
  }

  /**
   * Send new application notification to company
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Created notification
   */
  async sendNewApplicationNotification(applicationId) {
    try {
      const application = await Application.findById(applicationId)
        .populate('userId', 'name email')
        .populate('jobId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      const templateData = {
        applicantName: application.userId.name,
        jobTitle: application.jobId.title,
        applicationDate: new Date().toLocaleDateString()
      };

      return await this.createNotification({
        recipient: application.jobId.companyId,
        recipientModel: 'Company',
        sender: application.userId._id,
        senderModel: 'User',
        type: NotificationType.NEW_APPLICATION,
        relatedJob: application.jobId._id,
        relatedApplication: application._id,
        templateData
      });

    } catch (error) {
      console.error('[NOTIFICATION] Error sending new application notification:', error);
      throw new NotificationError('Failed to send new application notification', error);
    }
  }

  /**
   * Send application withdrawal notification
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Created notification
   */
  async sendApplicationWithdrawalNotification(applicationId) {
    try {
      const application = await Application.findById(applicationId)
        .populate('userId', 'name email')
        .populate('jobId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      const templateData = {
        applicantName: application.userId.name,
        jobTitle: application.jobId.title,
        withdrawalDate: new Date().toLocaleDateString()
      };

      return await this.createNotification({
        recipient: application.jobId.companyId,
        recipientModel: 'Company',
        sender: application.userId._id,
        senderModel: 'User',
        type: NotificationType.APPLICATION_WITHDRAWN,
        relatedJob: application.jobId._id,
        relatedApplication: application._id,
        templateData
      });

    } catch (error) {
      console.error('[NOTIFICATION] Error sending withdrawal notification:', error);
      throw new NotificationError('Failed to send withdrawal notification', error);
    }
  }

  /**
   * Get notification template
   * @param {string} type - Notification type
   * @param {string} status - Application status (for status updates)
   * @returns {Object} - Notification template
   */
  getNotificationTemplate(type, status = null) {
    if (type === NotificationType.STATUS_UPDATE && status) {
      return this.templates[type][status] || this.templates[type][ApplicationStatus.UNDER_REVIEW];
    }
    return this.templates[type] || {
      title: 'Notification',
      message: 'You have a new notification.',
      priority: 'medium',
      actionText: 'View Details'
    };
  }

  /**
   * Generate notification content from template
   * @param {Object} template - Notification template
   * @param {Object} data - Template data
   * @param {string} relatedJob - Related job ID
   * @param {string} relatedApplication - Related application ID
   * @returns {Promise<Object>} - Generated notification content
   */
  async generateNotificationContent(template, data, relatedJob, relatedApplication) {
    let { title, message, priority, actionText } = template;

    // Replace template variables
    const replaceVariables = (text, data) => {
      return text.replace(/\{(\w+)\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    title = replaceVariables(title, data);
    message = replaceVariables(message, data);

    // Generate action URL
    let actionUrl = '';
    if (relatedApplication) {
      actionUrl = `/applications/${relatedApplication}`;
    } else if (relatedJob) {
      actionUrl = `/jobs/${relatedJob}`;
    }

    return {
      title,
      message,
      priority,
      actionUrl,
      actionText
    };
  }

  /**
   * Send real-time notification via Socket.io
   * @param {Object} notification - Notification document
   */
  async sendRealTimeNotification(notification) {
    if (!this.io) {
      console.warn('[NOTIFICATION] Socket.io not available for real-time notifications');
      return;
    }

    try {
      const room = `user_${notification.recipient}`;
      
      // Send to specific user room
      this.io.to(room).emit('new_notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        relatedData: notification.relatedData
      });

      // Also send unread count update
      const unreadCount = await Notification.getUnreadCount(notification.recipient);
      this.io.to(room).emit('unread_count_update', { count: unreadCount });

      console.log(`[NOTIFICATION] Real-time notification sent to room: ${room}`);

    } catch (error) {
      console.error('[NOTIFICATION] Error sending real-time notification:', error);
    }
  }

  /**
   * Get notifications for a user/company
   * @param {string} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Notifications and metadata
   */
  async getNotifications(recipientId, options = {}) {
    try {
      const notifications = await Notification.getNotificationsForRecipient(recipientId, options);
      const unreadCount = await Notification.getUnreadCount(recipientId);
      const totalCount = await Notification.countDocuments({
        recipient: recipientId,
        isActive: true
      });

      return {
        notifications: notifications.map(n => n.getSummary()),
        pagination: {
          page: options.page || 1,
          limit: options.limit || 20,
          total: totalCount,
          unreadCount
        }
      };

    } catch (error) {
      console.error('[NOTIFICATION] Error getting notifications:', error);
      throw new NotificationError('Failed to get notifications', error);
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      const updatedNotification = await notification.markAsRead();

      // Send updated unread count
      if (this.io) {
        const unreadCount = await Notification.getUnreadCount(userId);
        this.io.to(`user_${userId}`).emit('unread_count_update', { count: unreadCount });
      }

      return updatedNotification;

    } catch (error) {
      console.error('[NOTIFICATION] Error marking as read:', error);
      throw new NotificationError('Failed to mark notification as read', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Update result
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.markAllAsRead(userId);

      // Send updated unread count
      if (this.io) {
        this.io.to(`user_${userId}`).emit('unread_count_update', { count: 0 });
      }

      return result;

    } catch (error) {
      console.error('[NOTIFICATION] Error marking all as read:', error);
      throw new NotificationError('Failed to mark all notifications as read', error);
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} - Delete result
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: userId
        },
        {
          isActive: false
        },
        { new: true }
      );

      if (!result) {
        throw new Error('Notification not found or access denied');
      }

      // Send updated unread count if it was unread
      if (this.io && !result.isRead) {
        const unreadCount = await Notification.getUnreadCount(userId);
        this.io.to(`user_${userId}`).emit('unread_count_update', { count: unreadCount });
      }

      return result;

    } catch (error) {
      console.error('[NOTIFICATION] Error deleting notification:', error);
      throw new NotificationError('Failed to delete notification', error);
    }
  }

  /**
   * Cleanup old notifications (maintenance task)
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanupOldNotifications(daysOld = 90) {
    try {
      const result = await Notification.cleanupOldNotifications(daysOld);
      console.log(`[NOTIFICATION] Cleaned up ${result.deletedCount} old notifications`);
      return result;

    } catch (error) {
      console.error('[NOTIFICATION] Error cleaning up notifications:', error);
      throw new NotificationError('Failed to cleanup old notifications', error);
    }
  }

  /**
   * Get notification statistics
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<Object>} - Notification statistics
   */
  async getNotificationStats(recipientId) {
    try {
      const [
        totalCount,
        unreadCount,
        statusUpdateCount,
        applicationCount
      ] = await Promise.all([
        Notification.countDocuments({ recipient: recipientId, isActive: true }),
        Notification.getUnreadCount(recipientId),
        Notification.countDocuments({ 
          recipient: recipientId, 
          type: NotificationType.STATUS_UPDATE,
          isActive: true 
        }),
        Notification.countDocuments({ 
          recipient: recipientId, 
          type: NotificationType.NEW_APPLICATION,
          isActive: true 
        })
      ]);

      return {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
        byType: {
          statusUpdates: statusUpdateCount,
          applications: applicationCount
        }
      };

    } catch (error) {
      console.error('[NOTIFICATION] Error getting notification stats:', error);
      throw new NotificationError('Failed to get notification statistics', error);
    }
  }
}

/**
 * Custom error class for notification service
 */
class NotificationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NotificationError';
    this.originalError = originalError;
    
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export default NotificationService;
export { NotificationError };
