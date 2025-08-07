# 🔔 Notification System Documentation

A comprehensive, production-ready notification system for the Job Portal MERN stack application, supporting real-time updates for both job seekers and recruiters.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Real-time Features](#real-time-features)
- [Testing](#testing)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features
- **Real-time Notifications**: Instant delivery via Socket.io
- **Notification History**: Persistent storage with MongoDB
- **Mark as Read/Unread**: User interaction tracking
- **Notification Types**: Support for multiple notification categories
- **Priority Levels**: Low, Medium, High, Urgent
- **User/Company Support**: Works for both job seekers and recruiters
- **Toast Notifications**: Real-time popup notifications
- **Notification Bell**: Badge with unread count
- **REST API**: Complete CRUD operations
- **Responsive Design**: Mobile-friendly UI components

### Notification Types
- `STATUS_UPDATE`: Application status changes
- `NEW_APPLICATION`: New job applications
- `APPLICATION_WITHDRAWN`: Withdrawn applications
- `JOB_POSTED`: New job postings
- `JOB_DEADLINE_REMINDER`: Application deadline reminders
- `PROFILE_VIEW`: Profile view notifications

### Priority Levels
- `low`: Non-urgent informational notifications
- `medium`: Standard notifications (default)
- `high`: Important notifications requiring attention
- `urgent`: Critical notifications requiring immediate action

## 🏗️ Architecture

### Backend Components
```
backend/
├── models/notification.model.js     # Mongoose schema and model
├── services/notification.service.js # Business logic and Socket.io integration
├── routers/notification.js          # REST API endpoints
├── middleware/auth.js               # Authentication middleware
└── app.js & index.js               # Socket.io setup and server configuration
```

### Frontend Components
```
frontend/src/
├── context/NotificationContext.jsx  # Global state management
├── Components/
│   ├── NotificationBell.jsx         # Notification bell component
│   ├── NotificationBell.css         # Bell component styles
│   ├── ToastNotification.jsx        # Toast popup component
│   └── ToastNotification.css        # Toast component styles
└── main.jsx                        # App wrapper with NotificationProvider
```

### Database Schema
```javascript
{
  recipientId: ObjectId,           // User or Company ID
  recipientType: 'user|company',   // Recipient type
  type: String,                    // Notification type enum
  title: String,                   // Notification title
  message: String,                 // Notification content
  isRead: Boolean,                 // Read status
  priority: String,                // Priority level
  data: Object,                    // Additional metadata
  createdAt: Date,                 // Creation timestamp
  readAt: Date                     // Read timestamp
}
```

## 🚀 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- React (v18+)
- Socket.io compatible browser

### Backend Dependencies
```bash
cd backend
npm install socket.io express-validator
```

### Frontend Dependencies
```bash
cd frontend
npm install socket.io-client
```

### Environment Variables
Add to your `backend/.env`:
```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/your_database
NODE_ENV=development
```

## 📖 Usage

### 1. Start the Servers
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 2. Login to the Application
- Navigate to `http://localhost:5173`
- Sign in as a user or company
- The notification bell will appear in the navigation bar

### 3. Test Notifications
- Open the test page: `http://localhost:3000/test-notification.html`
- Get your JWT token from browser dev tools (Application > Cookies or Local Storage)
- Create test notifications to see the system in action

### 4. Integration in Your Components

#### Using the Notification Context
```jsx
import { useNotification } from '../context/NotificationContext';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAsUnread, 
    deleteNotification 
  } = useNotification();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {/* Your component content */}
    </div>
  );
}
```

#### Adding the Notification Bell
```jsx
import NotificationBell from './Components/NotificationBell';

function NavBar() {
  return (
    <nav>
      {/* Other nav items */}
      <NotificationBell />
    </nav>
  );
}
```

#### Triggering Notifications (Backend)
```javascript
import NotificationService from '../services/notification.service.js';

const notificationService = new NotificationService();

// Create a notification
await notificationService.createNotification({
  recipientId: userId,
  recipientType: 'user',
  type: 'STATUS_UPDATE',
  title: 'Application Status Updated',
  message: 'Your application for Software Engineer has been reviewed.',
  priority: 'high',
  data: {
    applicationId: applicationId,
    jobId: jobId,
    newStatus: 'reviewed'
  }
});
```

## 🔌 API Endpoints

### Base URL: `/api/notifications`

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- type: string (notification type filter)
- isRead: boolean (read status filter)
- priority: string (priority filter)

Response:
{
  "notifications": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalCount": 100,
  "unreadCount": 15
}
```

#### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "message": "Notification marked as read",
  "notification": {...}
}
```

#### Mark as Unread
```http
PATCH /api/notifications/:id/unread
Authorization: Bearer <token>

Response:
{
  "message": "Notification marked as unread",
  "notification": {...}
}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>

Response:
{
  "message": "Notification deleted successfully"
}
```

#### Mark All as Read
```http
PATCH /api/notifications/mark-all-read
Authorization: Bearer <token>

Response:
{
  "message": "All notifications marked as read",
  "modifiedCount": 10
}
```

#### Get Statistics
```http
GET /api/notifications/stats
Authorization: Bearer <token>

Response:
{
  "totalCount": 100,
  "unreadCount": 15,
  "todayCount": 5,
  "byType": {
    "STATUS_UPDATE": 30,
    "NEW_APPLICATION": 25,
    ...
  },
  "byPriority": {
    "urgent": 2,
    "high": 8,
    "medium": 70,
    "low": 20
  }
}
```

#### Create Test Notification (Development)
```http
POST /api/notifications/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_or_company_id",
  "recipientType": "user",
  "type": "STATUS_UPDATE",
  "title": "Test Notification",
  "message": "This is a test notification",
  "priority": "medium"
}
```

## ⚡ Real-time Features

### Socket.io Events

#### Client Events (Listen)
```javascript
socket.on('notification', (notification) => {
  console.log('New notification received:', notification);
});

socket.on('notification_update', (data) => {
  console.log('Notification updated:', data);
});

socket.on('connect', () => {
  console.log('Connected to notification server');
});
```

#### Server Events (Emit)
```javascript
// In NotificationService
this.io.to(`user_${userId}`).emit('notification', notification);
this.io.to(`company_${companyId}`).emit('notification_update', data);
```

### User Rooms
- Users automatically join room: `user_{userId}`
- Companies automatically join room: `company_{companyId}`
- Notifications are sent to specific rooms for targeted delivery

## 🧪 Testing

### Manual Testing Steps

1. **Authentication Test**
   - Login to the application
   - Copy JWT token from browser
   - Use test page to verify API access

2. **Notification Creation**
   - Use test page to create notifications
   - Verify database storage
   - Check real-time delivery

3. **UI Component Test**
   - Check notification bell badge
   - Test dropdown functionality
   - Verify toast notifications
   - Test mark as read/unread

4. **Real-time Test**
   - Open application in multiple tabs
   - Create notification in one tab
   - Verify real-time delivery in other tabs

### Automated Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Scenarios
- [ ] User receives notification for application status change
- [ ] Company receives notification for new application
- [ ] Real-time delivery works across browser tabs
- [ ] Notification bell updates unread count
- [ ] Toast notifications display correctly
- [ ] Mark as read/unread functionality
- [ ] Delete notification functionality
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] Mobile responsive design

## ⚙️ Configuration

### Backend Configuration
```javascript
// app.js
const notificationService = new NotificationService();
app.use("/api/notifications", notificationRouter);

// index.js
setupSocketIO(io);
```

### Frontend Configuration
```jsx
// main.jsx
<NotificationProvider>
  <App />
</NotificationProvider>

// App.jsx
<ToastNotification />
```

### Environment-specific Settings
```javascript
// Development
const SOCKET_URL = 'http://localhost:3000';

// Production
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Socket.io Connection Failed
```
Solution: Check if backend server is running and Socket.io is properly configured
Debug: Check browser console for connection errors
```

#### 2. Notifications Not Appearing
```
Solution: Verify authentication token and user room joining
Debug: Check Socket.io room logs and notification service logs
```

#### 3. Real-time Updates Not Working
```
Solution: Check Socket.io client connection and event listeners
Debug: Monitor network tab for Socket.io handshake
```

#### 4. Database Connection Issues
```
Solution: Verify MongoDB connection and notification model indexes
Debug: Check database logs and connection string
```

#### 5. Authentication Errors
```
Solution: Verify JWT token format and middleware configuration
Debug: Check auth middleware logs and token validation
```

### Debug Commands
```bash
# Check Socket.io connections
curl -X GET http://localhost:3000/api/notifications

# Check database documents
mongo your_database
db.notifications.find().pretty()

# Check server logs
npm start --verbose
```

### Performance Optimization
- Use pagination for large notification lists
- Implement notification cleanup for old notifications
- Use database indexes for faster queries
- Consider Redis for high-traffic scenarios
- Implement rate limiting for notification creation

## 📝 Additional Notes

### Security Considerations
- All endpoints require authentication
- Users can only access their own notifications
- Input validation on all endpoints
- Rate limiting recommended for production

### Scalability
- Socket.io supports clustering with Redis adapter
- Database indexes for performance
- Pagination for large datasets
- Notification cleanup strategies

### Future Enhancements
- Email notification integration
- Push notification support
- Notification preferences
- Advanced filtering options
- Notification templates
- Analytics and reporting

---

## 🎉 Success!

Your notification system is now fully implemented and ready for production use. The system provides:

- ✅ Real-time notifications via Socket.io
- ✅ Persistent notification storage
- ✅ Complete REST API
- ✅ React components with context
- ✅ Toast notifications
- ✅ Notification bell with badge
- ✅ Mobile-responsive design
- ✅ User and company support
- ✅ Comprehensive testing tools

For any issues or questions, refer to the troubleshooting section or check the server logs for detailed error information.
