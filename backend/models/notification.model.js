import mongoose from "mongoose";

// Application Status Enum
export const ApplicationStatus = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  JOB_OFFERED: 'JOB_OFFERED',
  REJECTED: 'REJECTED'
};

// Notification Type Enum
export const NotificationType = {
  STATUS_UPDATE: 'STATUS_UPDATE',
  NEW_APPLICATION: 'NEW_APPLICATION',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN',
  JOB_POSTED: 'JOB_POSTED',
  JOB_DEADLINE_REMINDER: 'JOB_DEADLINE_REMINDER',
  PROFILE_VIEW: 'PROFILE_VIEW'
};

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient is required'],
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: [true, 'Recipient model is required'],
    enum: ['User', 'Company']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Company', 'System'],
    default: 'System'
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: Object.values(NotificationType)
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isActive: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for recipient details
notificationSchema.virtual('recipientDetails', {
  ref: function() { return this.recipientModel; },
  localField: 'recipient',
  foreignField: '_id',
  justOne: true
});

// Virtual for sender details
notificationSchema.virtual('senderDetails', {
  ref: function() { return this.senderModel; },
  localField: 'sender',
  foreignField: '_id',
  justOne: true
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  if (this.isRead) {
    this.isRead = false;
    this.readAt = null;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get notifications for a user/company
notificationSchema.statics.getNotificationsForRecipient = function(recipientId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    isRead,
    priority,
    includeInactive = false
  } = options;

  const query = {
    recipient: recipientId,
    ...(includeInactive ? {} : { isActive: true })
  };

  if (type) {
    query.type = type;
  }

  if (typeof isRead === 'boolean') {
    query.isRead = isRead;
  }

  if (priority) {
    query.priority = priority;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('relatedJob', 'title companyId location')
    .populate('relatedApplication', 'status dateApplied')
    .populate('senderDetails', 'name email companyName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    isRead: false,
    isActive: true
  });
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function(recipientId) {
  return this.updateMany(
    {
      recipient: recipientId,
      isRead: false,
      isActive: true
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to cleanup old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration for certain notification types
  if (!this.expiresAt && this.type === NotificationType.JOB_DEADLINE_REMINDER) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Expire in 30 days
    this.expiresAt = expirationDate;
  }

  next();
});

// Method to generate notification summary
notificationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    message: this.message.length > 100 ? 
      this.message.substring(0, 100) + '...' : 
      this.message,
    isRead: this.isRead,
    priority: this.priority,
    createdAt: this.createdAt,
    actionUrl: this.actionUrl,
    actionText: this.actionText
  };
};

export default mongoose.model("Notification", notificationSchema);
