import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routers/user.js";
import companyRouter from "./routers/company.js"; // <-- Add this

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only userRouter for login/register
app.use("/auth", userRouter);

// Company login/register/validate
app.use("/company", companyRouter); // <-- Add this

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
