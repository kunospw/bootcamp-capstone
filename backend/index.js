import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import app, { setupSocketIO } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

// Create HTTP server
const server = createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Setup Socket.io for notifications
setupSocketIO(io);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Database connected");
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Socket.io server ready for real-time notifications`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    });
  })
  .catch((e) => {
    console.log("❌ Database connection error: ", e.message);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
