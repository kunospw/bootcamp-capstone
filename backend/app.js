import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import userRouter from "./routers/user.js";
import companyRouter from "./routers/company.js";
import jobRouter from "./routers/job.js";
import applicationRouter from "./routers/application.js";
import cvAnalyzerRouter from "./routers/cv-analyzer.js";
import savedJobRouter from "./routers/savedjob.js";
import notificationRouter from "./routers/notification.js";
import NotificationService from "./services/notification.service.js";
import { setNotificationService } from "./routers/notification.js";
import { setNotificationServiceForApplications } from "./routers/application.js";

dotenv.config();

const app = express();

// Initialize notification service
const notificationService = new NotificationService();

// Set notification service in routers
setNotificationService(notificationService);
setNotificationServiceForApplications(notificationService);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Serve test files (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('.')); // Serve files from root directory for testing
}

app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session middleware BEFORE passport
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
    })
);

// Initialize passport AFTER session
app.use(passport.initialize());
app.use(passport.session());

// Routes - back to original structure with saved jobs added
app.use("/auth", userRouter);
app.use("/company", companyRouter);
app.use("/api/jobs", jobRouter); // Legacy route for backward compatibility
app.use("/api/v1/jobs", jobRouter); // New versioned route
app.use("/api/applications", applicationRouter);
app.use("/api/saved-jobs", savedJobRouter);
app.use("/api/v1/cv-analyzer", cvAnalyzerRouter);
app.use("/api/notifications", notificationRouter); // New notification routes

// Basic test route
app.get("/", (req, res) => {
    res.json({ message: "Job Portal API is running!" });
});

// Add a test route for saved jobs to debug
app.get("/api/saved-jobs-test", (req, res) => {
    res.json({ message: "Saved jobs endpoint is accessible!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// 404 handler for debugging - FIXED: Use proper Express wildcard syntax
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

/**
 * Setup Socket.io for real-time notifications
 * @param {Server} io - Socket.io server instance
 */
export function setupSocketIO(io) {
    console.log('Setting up Socket.io for notifications...');
    
    // Set Socket.io instance in notification service
    notificationService.setSocketIO(io);
    
    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);
        
        // Handle user authentication and room joining
        socket.on('authenticate', (data) => {
            try {
                const { userId, userType } = data; // userType: 'user' | 'company'
                
                if (userId) {
                    const room = `user_${userId}`;
                    socket.join(room);
                    socket.userId = userId;
                    socket.userType = userType;
                    
                    console.log(`[SOCKET] ${userType} ${userId} joined room: ${room}`);
                    
                    // Send confirmation
                    socket.emit('authenticated', { 
                        success: true, 
                        room: room,
                        message: 'Successfully authenticated for real-time notifications'
                    });
                    
                    // Send current unread count
                    const Notification = require('./models/notification.model.js').default;
                    Notification.getUnreadCount(userId).then(count => {
                        socket.emit('unread_count_update', { count });
                    }).catch(err => {
                        console.error('[SOCKET] Error getting unread count:', err);
                    });
                }
            } catch (error) {
                console.error('[SOCKET] Authentication error:', error);
                socket.emit('authenticated', { 
                    success: false, 
                    message: 'Authentication failed' 
                });
            }
        });
        
        // Handle manual notification mark as read
        socket.on('mark_notification_read', async (data) => {
            try {
                const { notificationId } = data;
                const userId = socket.userId;
                
                if (userId && notificationId) {
                    await notificationService.markAsRead(notificationId, userId);
                    console.log(`[SOCKET] Notification ${notificationId} marked as read by user ${userId}`);
                }
            } catch (error) {
                console.error('[SOCKET] Error marking notification as read:', error);
            }
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[SOCKET] User disconnected: ${socket.id} (User: ${socket.userId})`);
        });
        
        // Handle connection errors
        socket.on('error', (error) => {
            console.error('[SOCKET] Socket error:', error);
        });
    });
    
    console.log('✅ Socket.io setup completed');
}

export default app;