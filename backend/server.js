require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const authRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

// 🔴 Real-time updates using Socket.io
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("joinEvent", ({ eventId, userId }) => {
    socket.join(eventId);
    io.to(eventId).emit("attendeeUpdate", {
      message: "A new user joined the event",
      userId,
    });
  });

  socket.on("leaveEvent", ({ eventId, userId }) => {
    io.to(eventId).emit("attendeeUpdate", {
      message: "A user left the event",
      userId,
    });
    socket.leave(eventId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { io };
