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

dotenv.config();

const app = express();

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

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

app.use("/auth", userRouter);
app.use("/company", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/v1/cv-analyzer", cvAnalyzerRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
