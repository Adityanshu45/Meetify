import dotenv from "dotenv";
dotenv.config();

// DNS configuration
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const port = process.env.PORT || 8080;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import cron from "node-cron";

import connectDB from "./config/database.js";
import authRoute from "./routes/authRoutes.js";
import meetingsRoute from "./routes/meetingsRoutes.js";
import connectToServer from "./controllers/socketController.js";
import meetingsModel from "./models/meetingsModel.js";

const app = express();

// Create HTTP server using Express app
const server = http.createServer(app);

//---------------------------middleware-------------------------
// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//connect to MongoDB Server
connectDB();

// Initialize Socket.IO server
connectToServer(server);

// ----------------API ROUTES --------------------

// Authentication routes
app.use("/api/auth", authRoute);

//meetingHistory routes
app.use("/api/meeting", meetingsRoute);

//Start Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// its automatically run 03:00 AM everyday
cron.schedule("0 3 * * *", async () => {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  try {
    const result = await meetingsModel.updateMany(
      {
        status: "live",
        startAt: { $lte: twelveHoursAgo },
      },
      {
        $set: { status: "completed", endAt: Date.now() },
      },
    );
  } catch (error) {
    console.log("Error in Cron Job:", error);
  }

  //handle Expired Scheduled Meetings
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const expiredMeetings = await meetingsModel.updateMany(
      {
        status: "scheduled",
        scheduledAt: { $lte: oneDayAgo },
      },
      {
        $set: { status: "cancelled" },
      },
    );
  } catch (error) {
    console.log("Error cancelling expired meetings:", error);
  }
});
